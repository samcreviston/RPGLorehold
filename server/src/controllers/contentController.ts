import type { NextFunction, Request, Response } from 'express';
import * as contentService from '../services/contentService.js';
import { HttpError } from '../middleware/errorHandler.js';
import { contentUpsertSchema } from '../utils/validators.js';

function requireUserId(req: Request): string {
	if (!req.user?.id) {
		throw new HttpError(401, 'Authentication required');
	}
	return req.user.id;
}

function paramId(value: string | string[] | undefined): string {
	if (typeof value === 'string' && value) {
		return value;
	}
	throw new HttpError(400, 'Content id is required');
}

export async function createContent(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const content = await contentService.createContent(
			requireUserId(req),
			contentUpsertSchema.parse(req.body)
		);
		res.status(201).json({ content });
	} catch (error) {
		next(error);
	}
}

export async function listContent(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const contents = await contentService.listContentForOwner(requireUserId(req));
		res.json({ contents });
	} catch (error) {
		next(error);
	}
}

export async function getContent(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const content = await contentService.getContentForOwner(paramId(req.params.id), requireUserId(req));
		if (!content) {
			throw new HttpError(404, 'Content not found');
		}
		res.json({ content });
	} catch (error) {
		next(error);
	}
}

export async function updateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const content = await contentService.updateContent(
			paramId(req.params.id),
			requireUserId(req),
			contentUpsertSchema.parse(req.body)
		);
		if (!content) {
			throw new HttpError(404, 'Content not found');
		}
		res.json({ content });
	} catch (error) {
		next(error);
	}
}

export async function deleteContent(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const deleted = await contentService.deleteContent(paramId(req.params.id), requireUserId(req));
		if (!deleted) {
			throw new HttpError(404, 'Content not found');
		}
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

export async function getPublicContent(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const slug = typeof req.params.slug === 'string' ? req.params.slug : '';
		const content = await contentService.getPublicContent(slug);
		if (!content) {
			throw new HttpError(404, 'Content not found');
		}
		res.json({ content });
	} catch (error) {
		next(error);
	}
}
