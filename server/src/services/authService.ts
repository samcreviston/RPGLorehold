import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import type { AuthUser, JwtAccessPayload } from '../types/userTypes.js';
import { HttpError } from '../middleware/errorHandler.js';

const BCRYPT_ROUNDS = 12;

function toAuthUser(user: {
	_id: mongoose.Types.ObjectId;
	email: string;
	username: string;
	role: 'user' | 'admin';
}): AuthUser {
	return {
		id: String(user._id),
		email: user.email,
		username: user.username,
		role: user.role
	};
}

export function signAccessToken(user: AuthUser): string {
	const payload: JwtAccessPayload = { sub: user.id, role: user.role };
	return jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: env.JWT_ACCESS_EXPIRES as NonNullable<jwt.SignOptions['expiresIn']>
	});
}

export function verifyAccessToken(token: string): JwtAccessPayload {
	const decoded = jwt.verify(token, env.JWT_SECRET);
	if (typeof decoded === 'string' || !decoded.sub || !decoded.role) {
		throw new HttpError(401, 'Invalid access token');
	}
	return {
		sub: String(decoded.sub),
		role: decoded.role as 'user' | 'admin'
	};
}

function createRefreshTokenValue(): string {
	return crypto.randomBytes(48).toString('hex');
}

export async function registerUser(input: {
	email: string;
	username: string;
	password: string;
}): Promise<AuthUser> {
	const email = input.email.toLowerCase().trim();
	const username = input.username.trim();

	const existing = await User.findOne({
		$or: [{ email }, { username }]
	});

	if (existing) {
		if (existing.email === email) {
			throw new HttpError(409, 'Email is already registered');
		}
		throw new HttpError(409, 'Username is already taken');
	}

	const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
	const user = await User.create({
		email,
		username,
		passwordHash,
		role: 'user',
		emailVerified: false
	});

	return toAuthUser(user);
}

export async function loginUser(
	input: { email: string; password: string },
	meta: { userAgent?: string; ipAddress?: string } = {}
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
	const email = input.email.toLowerCase().trim();
	const user = await User.findOne({ email });

	if (!user) {
		throw new HttpError(401, 'Invalid email or password');
	}

	const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
	if (!passwordMatches) {
		throw new HttpError(401, 'Invalid email or password');
	}

	const authUser = toAuthUser(user);
	const accessToken = signAccessToken(authUser);
	const rawRefresh = createRefreshTokenValue();
	const refreshTokenHash = await bcrypt.hash(rawRefresh, BCRYPT_ROUNDS);
	const expiresAt = new Date(
		Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
	);

	const session = await Session.create({
		userId: user._id,
		refreshTokenHash,
		expiresAt,
		userAgent: meta.userAgent ?? '',
		ipAddress: meta.ipAddress ?? '',
		revokedAt: null
	});

	const refreshToken = `${String(session._id)}.${rawRefresh}`;
	return { user: authUser, accessToken, refreshToken };
}

function parseRefreshCookie(refreshToken: string): { sessionId: string; rawToken: string } | null {
	const separatorIndex = refreshToken.indexOf('.');
	if (separatorIndex <= 0 || separatorIndex === refreshToken.length - 1) {
		return null;
	}
	return {
		sessionId: refreshToken.slice(0, separatorIndex),
		rawToken: refreshToken.slice(separatorIndex + 1)
	};
}

export async function refreshSession(
	refreshToken: string,
	meta: { userAgent?: string; ipAddress?: string } = {}
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
	const parsed = parseRefreshCookie(refreshToken);
	if (!parsed || !mongoose.Types.ObjectId.isValid(parsed.sessionId)) {
		throw new HttpError(401, 'Invalid refresh token');
	}

	const session = await Session.findById(parsed.sessionId);
	if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
		throw new HttpError(401, 'Invalid refresh token');
	}

	const matches = await bcrypt.compare(parsed.rawToken, session.refreshTokenHash);
	if (!matches) {
		throw new HttpError(401, 'Invalid refresh token');
	}

	const user = await User.findById(session.userId);
	if (!user) {
		throw new HttpError(401, 'User not found');
	}

	session.revokedAt = new Date();
	await session.save();

	const authUser = toAuthUser(user);
	const accessToken = signAccessToken(authUser);
	const rawRefresh = createRefreshTokenValue();
	const refreshTokenHash = await bcrypt.hash(rawRefresh, BCRYPT_ROUNDS);
	const expiresAt = new Date(
		Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
	);

	const nextSession = await Session.create({
		userId: user._id,
		refreshTokenHash,
		expiresAt,
		userAgent: meta.userAgent ?? '',
		ipAddress: meta.ipAddress ?? '',
		revokedAt: null
	});

	return {
		user: authUser,
		accessToken,
		refreshToken: `${String(nextSession._id)}.${rawRefresh}`
	};
}

export async function logoutSession(refreshToken?: string): Promise<void> {
	if (!refreshToken) {
		return;
	}

	const parsed = parseRefreshCookie(refreshToken);
	if (!parsed || !mongoose.Types.ObjectId.isValid(parsed.sessionId)) {
		return;
	}

	const session = await Session.findById(parsed.sessionId);
	if (!session || session.revokedAt) {
		return;
	}

	const matches = await bcrypt.compare(parsed.rawToken, session.refreshTokenHash);
	if (!matches) {
		return;
	}

	session.revokedAt = new Date();
	await session.save();
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
	const user = await User.findById(userId);
	return user ? toAuthUser(user) : null;
}

export async function changePassword(
	userId: string,
	currentPassword: string,
	newPassword: string
): Promise<void> {
	const user = await User.findById(userId);
	if (!user) {
		throw new HttpError(404, 'User not found');
	}

	const matches = await bcrypt.compare(currentPassword, user.passwordHash);
	if (!matches) {
		throw new HttpError(401, 'Current password is incorrect');
	}

	user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
	await user.save();

	await Session.updateMany(
		{ userId: user._id, revokedAt: null },
		{ $set: { revokedAt: new Date() } }
	);
}

export async function updateProfile(
	userId: string,
	input: { username?: string; email?: string }
): Promise<AuthUser> {
	const user = await User.findById(userId);
	if (!user) {
		throw new HttpError(404, 'User not found');
	}

	if (typeof input.email === 'string') {
		const email = input.email.toLowerCase().trim();
		const taken = await User.findOne({ email, _id: { $ne: user._id } });
		if (taken) {
			throw new HttpError(409, 'Email is already registered');
		}
		user.email = email;
		user.emailVerified = false;
	}

	if (typeof input.username === 'string') {
		const username = input.username.trim();
		const taken = await User.findOne({ username, _id: { $ne: user._id } });
		if (taken) {
			throw new HttpError(409, 'Username is already taken');
		}
		user.username = username;
	}

	await user.save();
	return toAuthUser(user);
}

export async function trackModuleOwnership(
	userId: string,
	moduleId: string
): Promise<void> {
	const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
	await User.findByIdAndUpdate(userId, {
		$addToSet: { createdModules: moduleObjectId },
		$push: {
			recentlyEdited: {
				$each: [moduleObjectId],
				$position: 0,
				$slice: 20
			}
		}
	});
}

export async function untrackModuleOwnership(
	userId: string,
	moduleId: string
): Promise<void> {
	const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
	await User.findByIdAndUpdate(userId, {
		$pull: {
			createdModules: moduleObjectId,
			recentlyEdited: moduleObjectId,
			favoriteModules: moduleObjectId
		}
	});
}
