import type { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService.js';
import * as moduleService from '../services/moduleService.js';
import type { ModuleStatus } from '../types/moduleTypes.js';
import { moduleUpsertSchema } from '../utils/validators.js';
import { HttpError } from '../middleware/errorHandler.js';

function requireUserId(req: Request): string {
	if (!req.user?.id) {
		throw new HttpError(401, 'Authentication required');
	}
	return req.user.id;
}

function paramId(value: string | string[] | undefined): string {
	if (typeof value === 'string' && value.length > 0) {
		return value;
	}
	throw new HttpError(400, 'Module id is required');
}

export async function createModule(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authorId = requireUserId(req);
		const body = moduleUpsertSchema.parse(req.body);
		const status: ModuleStatus = body.status ?? 'draft';
		const { status: _ignored, ...input } = body;
		const doc = await moduleService.createModule(authorId, input, status);
		await authService.trackModuleOwnership(authorId, String(doc._id));
		res.status(201).json({ module: doc });
	} catch (error) {
		next(error);
	}
}

export async function listModules(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authorId = requireUserId(req);
		const statusQuery = req.query.status;
		const status =
			typeof statusQuery === 'string' && (statusQuery === 'draft' || statusQuery === 'published')
				? statusQuery
				: undefined;

		const modules = await moduleService.listModulesForAuthor(authorId, status);
		res.json({ modules });
	} catch (error) {
		next(error);
	}
}

export async function getModule(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authorId = requireUserId(req);
		const id = paramId(req.params.id);
		const doc = await moduleService.getModuleById(id, authorId);
		if (!doc) {
			throw new HttpError(404, 'Module not found');
		}

		res.json({ module: doc });
	} catch (error) {
		next(error);
	}
}

export async function getPublishedModule(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const id = paramId(req.params.id);
		const result = await moduleService.getPublishedModuleById(id);
		if (!result) {
			throw new HttpError(404, 'Published module not found');
		}

		res.json({
			module: result.module,
			authorUsername: result.authorUsername
		});
	} catch (error) {
		next(error);
	}
}

export async function updateModule(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authorId = requireUserId(req);
		const id = paramId(req.params.id);
		const body = moduleUpsertSchema.parse(req.body);
		const { status, ...input } = body;
		const doc = await moduleService.updateModule(id, authorId, input, status);
		if (!doc) {
			throw new HttpError(404, 'Module not found');
		}

		await authService.trackModuleOwnership(authorId, String(doc._id));
		res.json({ module: doc });
	} catch (error) {
		next(error);
	}
}

export async function publishModule(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authorId = requireUserId(req);
		const body = moduleUpsertSchema.parse(req.body);
		const { status: _ignored, ...input } = body;
		const rawId = req.params.id;

		if (typeof rawId === 'string' && rawId.length > 0) {
			const doc = await moduleService.updateModule(rawId, authorId, input, 'published');
			if (!doc) {
				throw new HttpError(404, 'Module not found');
			}
			await authService.trackModuleOwnership(authorId, String(doc._id));
			res.json({ module: doc });
			return;
		}

		const doc = await moduleService.createModule(authorId, input, 'published');
		await authService.trackModuleOwnership(authorId, String(doc._id));
		res.status(201).json({ module: doc });
	} catch (error) {
		next(error);
	}
}

export async function deleteModule(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authorId = requireUserId(req);
		const id = paramId(req.params.id);
		const deleted = await moduleService.deleteModule(id, authorId);
		if (!deleted) {
			throw new HttpError(404, 'Module not found');
		}

		await authService.untrackModuleOwnership(authorId, id);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

export async function listFavoriteModules(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const userId = requireUserId(req);
		const modules = await moduleService.listFavoriteModules(userId);
		res.json({ modules });
	} catch (error) {
		next(error);
	}
}

export async function addFavorite(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const userId = requireUserId(req);
		const id = paramId(req.params.id);
		const result = await moduleService.addFavorite(userId, id);
		if (!result) {
			throw new HttpError(404, 'Published module not found');
		}
		res.json(result);
	} catch (error) {
		next(error);
	}
}

export async function removeFavorite(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const userId = requireUserId(req);
		const id = paramId(req.params.id);
		const result = await moduleService.removeFavorite(userId, id);
		if (!result) {
			throw new HttpError(404, 'Published module not found');
		}
		res.json(result);
	} catch (error) {
		next(error);
	}
}
