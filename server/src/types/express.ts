import type { AuthUser } from './userTypes.js';

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

export {};
