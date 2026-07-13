import type { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { HttpError } from './errorHandler.js';

export async function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const accessToken =
			typeof req.cookies?.accessToken === 'string' ? req.cookies.accessToken : undefined;

		if (!accessToken) {
			throw new HttpError(401, 'Authentication required');
		}

		const payload = authService.verifyAccessToken(accessToken);
		const user = await authService.getUserById(payload.sub);
		if (!user) {
			throw new HttpError(401, 'Authentication required');
		}

		req.user = user;
		next();
	} catch (error) {
		if (error instanceof HttpError) {
			next(error);
			return;
		}
		next(new HttpError(401, 'Authentication required'));
	}
}
