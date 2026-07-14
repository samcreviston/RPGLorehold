import type { NextFunction, Request, Response } from 'express';
import * as campaignService from '../services/campaignService.js';
import { HttpError } from '../middleware/errorHandler.js';
import { campaignCreateSchema, campaignUpsertSchema } from '../utils/validators.js';

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
	throw new HttpError(400, 'Campaign id is required');
}

export async function createCampaign(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const ownerId = requireUserId(req);
		const body = campaignCreateSchema.parse(req.body);
		const campaign = await campaignService.createCampaign(ownerId, body.title);
		res.status(201).json({ campaign });
	} catch (error) {
		next(error);
	}
}

export async function listCampaigns(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const ownerId = requireUserId(req);
		const campaigns = await campaignService.listCampaignsForOwner(ownerId);
		res.json({ campaigns });
	} catch (error) {
		next(error);
	}
}

export async function getCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const ownerId = requireUserId(req);
		const campaign = await campaignService.getCampaignById(paramId(req.params.id), ownerId);
		if (!campaign) {
			throw new HttpError(404, 'Campaign not found');
		}
		res.json({ campaign });
	} catch (error) {
		next(error);
	}
}

export async function updateCampaign(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const ownerId = requireUserId(req);
		const campaign = await campaignService.updateCampaign(
			paramId(req.params.id),
			ownerId,
			campaignUpsertSchema.parse(req.body)
		);
		if (!campaign) {
			throw new HttpError(404, 'Campaign not found');
		}
		res.json({ campaign });
	} catch (error) {
		next(error);
	}
}

export async function deleteCampaign(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const ownerId = requireUserId(req);
		const deleted = await campaignService.deleteCampaign(paramId(req.params.id), ownerId);
		if (!deleted) {
			throw new HttpError(404, 'Campaign not found');
		}
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}
