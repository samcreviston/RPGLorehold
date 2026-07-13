import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

const isProd = env.NODE_ENV === 'production';

const baseCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: 'lax',
	path: '/'
};

export function setAuthCookies(
	res: Response,
	accessToken: string,
	refreshToken: string
): void {
	const refreshMaxAgeMs = env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

	res.cookie('accessToken', accessToken, {
		...baseCookieOptions,
		maxAge: 15 * 60 * 1000
	});

	res.cookie('refreshToken', refreshToken, {
		...baseCookieOptions,
		maxAge: refreshMaxAgeMs
	});
}

export function clearAuthCookies(res: Response): void {
	res.clearCookie('accessToken', baseCookieOptions);
	res.clearCookie('refreshToken', baseCookieOptions);
}
