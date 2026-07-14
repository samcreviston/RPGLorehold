import mongoose from 'mongoose';
import { Campaign, type CampaignDocument } from '../models/Campaign.js';
import { Module } from '../models/Module.js';
import { User } from '../models/User.js';
import type { CampaignUpsertInput } from '../types/campaignTypes.js';

export type CampaignModuleDetails = Record<string, unknown> & {
	_id: unknown;
	authorId: unknown;
};

export type CampaignView = {
	_id: unknown;
	ownerId: unknown;
	title: string;
	entries: Array<{
		id: string;
		moduleId: string;
		plannedStartingLevel: number;
		plannedEndingLevel: number;
		dmNotes: string;
		module: CampaignModuleDetails | null;
		authorUsername: string;
	}>;
	createdAt: unknown;
	updatedAt: unknown;
};

function toObjectId(value: string): mongoose.Types.ObjectId {
	if (!mongoose.isValidObjectId(value)) {
		throw new Error('Invalid module id');
	}
	return new mongoose.Types.ObjectId(value);
}

async function ensureModulesExist(entries: CampaignUpsertInput['entries']): Promise<void> {
	if (entries.length === 0) {
		return;
	}

	const moduleIds = [...new Set(entries.map((entry) => entry.moduleId))];
	const count = await Module.countDocuments({ _id: { $in: moduleIds }, status: 'published' });
	if (count !== moduleIds.length) {
		throw new Error('One or more modules are unavailable');
	}
}

async function toCampaignView(doc: CampaignDocument): Promise<CampaignView> {
	const entries = doc.entries.map((entry) => ({
		id: entry.id,
		moduleId: String(entry.moduleId),
		plannedStartingLevel: entry.plannedStartingLevel,
		plannedEndingLevel: entry.plannedEndingLevel,
		dmNotes: entry.dmNotes ?? ''
	}));
	const moduleIds = entries.map((entry) => toObjectId(entry.moduleId));
	const modules = moduleIds.length > 0 ? await Module.find({ _id: { $in: moduleIds } }).lean() : [];
	const moduleById = new Map(modules.map((module) => [String(module._id), module]));
	const authorIds = [...new Set(modules.map((module) => String(module.authorId)))];
	const authors =
		authorIds.length > 0
			? await User.find({ _id: { $in: authorIds } }).select('username').lean()
			: [];
	const usernameByAuthorId = new Map(authors.map((author) => [String(author._id), author.username]));

	return {
		_id: doc._id,
		ownerId: doc.ownerId,
		title: doc.title,
		entries: entries.map((entry) => {
			const module = moduleById.get(entry.moduleId) ?? null;
			return {
				...entry,
				module,
				authorUsername: module ? (usernameByAuthorId.get(String(module.authorId)) ?? '') : ''
			};
		}),
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt
	};
}

export async function createCampaign(ownerId: string, title: string): Promise<CampaignView> {
	const doc = await Campaign.create({
		ownerId: new mongoose.Types.ObjectId(ownerId),
		title: title.trim(),
		entries: []
	});
	return toCampaignView(doc);
}

export async function listCampaignsForOwner(ownerId: string): Promise<CampaignView[]> {
	const campaigns = await Campaign.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).sort({
		updatedAt: -1
	});
	return Promise.all(campaigns.map(toCampaignView));
}

export async function getCampaignById(
	campaignId: string,
	ownerId: string
): Promise<CampaignView | null> {
	const doc = await Campaign.findOne({
		_id: campaignId,
		ownerId: new mongoose.Types.ObjectId(ownerId)
	});
	return doc ? toCampaignView(doc) : null;
}

export async function updateCampaign(
	campaignId: string,
	ownerId: string,
	input: CampaignUpsertInput
): Promise<CampaignView | null> {
	await ensureModulesExist(input.entries);
	const doc = await Campaign.findOne({
		_id: campaignId,
		ownerId: new mongoose.Types.ObjectId(ownerId)
	});
	if (!doc) {
		return null;
	}

	doc.title = input.title.trim();
	doc.set(
		'entries',
		input.entries.map((entry) => ({
			...entry,
			moduleId: toObjectId(entry.moduleId),
			dmNotes: entry.dmNotes ?? ''
		}))
	);
	await doc.save();
	return toCampaignView(doc);
}

export async function deleteCampaign(campaignId: string, ownerId: string): Promise<boolean> {
	const deleted = await Campaign.findOneAndDelete({
		_id: campaignId,
		ownerId: new mongoose.Types.ObjectId(ownerId)
	});
	return Boolean(deleted);
}
