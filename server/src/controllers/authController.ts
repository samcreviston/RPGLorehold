import type { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { clearAuthCookies, setAuthCookies } from '../utils/cookies.js';
import {
	changePasswordSchema,
	loginSchema,
	registerSchema,
	updateProfileSchema
} from '../utils/authValidators.js';
import { HttpError } from '../middleware/errorHandler.js';

function requestMeta(req: Request) {
	return {
		userAgent: req.get('user-agent') ?? '',
		ipAddress: req.ip ?? ''
	};
}

export async function register(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const body = registerSchema.parse(req.body);
		const user = await authService.registerUser(body);
		res.status(201).json({
			message: 'Account created. Please sign in.',
			user: { id: user.id, email: user.email, username: user.username }
		});
	} catch (error) {
		next(error);
	}
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const body = loginSchema.parse(req.body);
		const result = await authService.loginUser(body, requestMeta(req));
		setAuthCookies(res, result.accessToken, result.refreshToken);
		res.json({ user: result.user });
	} catch (error) {
		next(error);
	}
}

export async function refresh(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const refreshToken =
			typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : undefined;
		if (!refreshToken) {
			throw new HttpError(401, 'Refresh token required');
		}

		const result = await authService.refreshSession(refreshToken, requestMeta(req));
		setAuthCookies(res, result.accessToken, result.refreshToken);
		res.json({ user: result.user });
	} catch (error) {
		next(error);
	}
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const refreshToken =
			typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : undefined;
		await authService.logoutSession(refreshToken);
		clearAuthCookies(res);
		res.json({ message: 'Signed out' });
	} catch (error) {
		next(error);
	}
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new HttpError(401, 'Authentication required');
		}
		res.json({ user: req.user });
	} catch (error) {
		next(error);
	}
}

export async function changePassword(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		if (!req.user) {
			throw new HttpError(401, 'Authentication required');
		}
		const body = changePasswordSchema.parse(req.body);
		await authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
		clearAuthCookies(res);
		res.json({ message: 'Password updated. Please sign in again.' });
	} catch (error) {
		next(error);
	}
}

export async function updateProfile(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		if (!req.user) {
			throw new HttpError(401, 'Authentication required');
		}
		const body = updateProfileSchema.parse(req.body);
		const updateInput: { username?: string; email?: string } = {};
		if (typeof body.username === 'string') {
			updateInput.username = body.username;
		}
		if (typeof body.email === 'string') {
			updateInput.email = body.email;
		}
		const user = await authService.updateProfile(req.user.id, updateInput);
		res.json({ user });
	} catch (error) {
		next(error);
	}
}
