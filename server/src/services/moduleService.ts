import mongoose from 'mongoose';
import { Module, type ModuleDocument } from '../models/Module.js';
import { User } from '../models/User.js';
import type { ModuleStatus, ModuleUpsertInput } from '../types/moduleTypes.js';
import {
	removeModuleFromIndexBackground,
	syncModuleIndexBackground
} from './indexingService.js';

export type PublishedModuleResult = {
	module: ModuleDocument;
	authorUsername: string;
};

function buildSearchText(input: ModuleUpsertInput): string {
	const adventureTitles = input.adventures.map((adventure) => adventure.title).join(' ');
	const tags = (input.tags ?? []).join(' ');
	return [input.title, input.flavorText ?? '', adventureTitles, tags].filter(Boolean).join(' ').trim();
}

function normalizeAdventures(input: ModuleUpsertInput) {
	return input.adventures.map((adventure, adventureIndex) => ({
		id: adventure.id,
		order: adventure.order ?? adventureIndex,
		title: adventure.title.trim(),
		summary: adventure.summary ?? '',
		estimatedPlayTime: adventure.estimatedPlayTime ?? 0,
		sections: adventure.sections.map((section, sectionIndex) => ({
			id: section.id,
			type: section.type,
			order: section.order ?? sectionIndex,
			content: section.content ?? '',
			imageID: section.imageID ?? '',
			caption: section.caption ?? ''
		}))
	}));
}

function applyUpsertFields(
	doc: ModuleDocument,
	input: ModuleUpsertInput,
	status: ModuleStatus
): void {
	const adventures = normalizeAdventures(input);

	doc.title = input.title.trim();
	doc.flavorText = input.flavorText ?? '';
	doc.startingLevel = input.startingLevel;
	doc.endingLevel = input.endingLevel;
	doc.numberOfAdventures = adventures.length;
	doc.playstyle = input.playstyle;
	doc.alignments = input.alignments ?? [];
	doc.biomes = input.biomes ?? [];
	doc.coverImage = input.coverImage ?? null;
	doc.tags = input.tags ?? [];
	doc.set('adventures', adventures);
	doc.searchText = buildSearchText(input);
	doc.status = status;
	doc.published = status === 'published';

	if (status === 'published' && !doc.publishedAt) {
		doc.publishedAt = new Date();
	}
}

export async function createModule(
	authorId: string,
	input: ModuleUpsertInput,
	status: ModuleStatus = 'draft'
): Promise<ModuleDocument> {
	const doc = new Module({
		authorId: new mongoose.Types.ObjectId(authorId),
		views: 0,
		favorites: 0,
		averageRating: 0,
		publishedAt: null
	});

	applyUpsertFields(doc, input, status);
	await doc.save();
	console.log('[modules] created in database', {
		id: String(doc._id),
		title: doc.title,
		status: doc.status,
		published: doc.published,
		publishedAt: doc.publishedAt
	});
	syncModuleIndexBackground(String(doc._id));
	return doc;
}

export async function updateModule(
	moduleId: string,
	authorId: string,
	input: ModuleUpsertInput,
	status?: ModuleStatus
): Promise<ModuleDocument | null> {
	const doc = await Module.findOne({
		_id: moduleId,
		authorId: new mongoose.Types.ObjectId(authorId)
	});

	if (!doc) {
		return null;
	}

	const nextStatus = status ?? (doc.status as ModuleStatus);
	applyUpsertFields(doc, input, nextStatus);
	doc.markModified('status');
	doc.markModified('published');
	doc.markModified('publishedAt');
	doc.markModified('adventures');
	await doc.save();
	console.log('[modules] updated in database', {
		id: String(doc._id),
		title: doc.title,
		status: doc.status,
		published: doc.published,
		publishedAt: doc.publishedAt
	});
	syncModuleIndexBackground(String(doc._id));
	return doc;
}

export async function getModuleById(
	moduleId: string,
	authorId?: string
): Promise<ModuleDocument | null> {
	const filter: Record<string, unknown> = { _id: moduleId };
	if (authorId) {
		filter.authorId = new mongoose.Types.ObjectId(authorId);
	}
	return Module.findOne(filter);
}

export async function getPublishedModuleById(
	moduleId: string
): Promise<PublishedModuleResult | null> {
	const doc = await Module.findOne({ _id: moduleId, status: 'published' });
	if (!doc) {
		return null;
	}

	const user = await User.findById(doc.authorId).select('username').lean();
	return {
		module: doc,
		authorUsername: user?.username ?? ''
	};
}

export async function listModulesForAuthor(
	authorId: string,
	status?: ModuleStatus
): Promise<ModuleDocument[]> {
	const filter: Record<string, unknown> = {
		authorId: new mongoose.Types.ObjectId(authorId)
	};
	if (status) {
		filter.status = status;
	}

	return Module.find(filter).sort({ updatedAt: -1 });
}

export async function setModuleStatus(
	moduleId: string,
	authorId: string,
	status: ModuleStatus,
	input?: ModuleUpsertInput
): Promise<ModuleDocument | null> {
	const doc = await Module.findOne({
		_id: moduleId,
		authorId: new mongoose.Types.ObjectId(authorId)
	});

	if (!doc) {
		return null;
	}

	if (input) {
		applyUpsertFields(doc, input, status);
	} else {
		doc.status = status;
		doc.published = status === 'published';
		if (status === 'published' && !doc.publishedAt) {
			doc.publishedAt = new Date();
		}
	}

	await doc.save();
	console.log('[modules] status updated in database', {
		id: String(doc._id),
		title: doc.title,
		status: doc.status,
		published: doc.published,
		publishedAt: doc.publishedAt
	});
	syncModuleIndexBackground(String(doc._id));
	return doc;
}

export async function deleteModule(
	moduleId: string,
	authorId: string
): Promise<boolean> {
	const result = await Module.findOneAndDelete({
		_id: moduleId,
		authorId: new mongoose.Types.ObjectId(authorId)
	});

	if (!result) {
		return false;
	}

	removeModuleFromIndexBackground(moduleId);
	return true;
}

export type FavoriteToggleResult = {
	favorited: boolean;
	favorites: number;
};

export type FavoriteModuleResult = {
	module: ModuleDocument;
	authorUsername: string;
};

export async function listFavoriteModules(userId: string): Promise<FavoriteModuleResult[]> {
	const user = await User.findById(userId).select('favoriteModules').lean();
	const favoriteIds = (user?.favoriteModules ?? []).map((id) => String(id));
	if (favoriteIds.length === 0) {
		return [];
	}

	const modules = await Module.find({
		_id: { $in: favoriteIds },
		status: 'published'
	});

	const byId = new Map(modules.map((module) => [String(module._id), module]));
	const ordered = favoriteIds
		.map((id) => byId.get(id))
		.filter((module): module is ModuleDocument => Boolean(module))
		.reverse();

	const authorIds = [...new Set(ordered.map((module) => String(module.authorId)))];
	const authors = await User.find({ _id: { $in: authorIds } }).select('username').lean();
	const usernameById = new Map(authors.map((author) => [String(author._id), author.username ?? '']));

	return ordered.map((module) => ({
		module,
		authorUsername: usernameById.get(String(module.authorId)) ?? ''
	}));
}

export async function addFavorite(
	userId: string,
	moduleId: string
): Promise<FavoriteToggleResult | null> {
	const module = await Module.findOne({ _id: moduleId, status: 'published' });
	if (!module) {
		return null;
	}

	const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
	const updatedUser = await User.findOneAndUpdate(
		{ _id: userId, favoriteModules: { $ne: moduleObjectId } },
		{ $addToSet: { favoriteModules: moduleObjectId } },
		{ new: true }
	);

	if (updatedUser) {
		module.favorites = Math.max(0, (module.favorites ?? 0) + 1);
		await module.save();
		syncModuleIndexBackground(moduleId);
	}

	const fresh = await Module.findById(moduleId).select('favorites').lean();
	return {
		favorited: true,
		favorites: fresh?.favorites ?? module.favorites ?? 0
	};
}

export async function removeFavorite(
	userId: string,
	moduleId: string
): Promise<FavoriteToggleResult | null> {
	const module = await Module.findOne({ _id: moduleId, status: 'published' });
	if (!module) {
		return null;
	}

	const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
	const updatedUser = await User.findOneAndUpdate(
		{ _id: userId, favoriteModules: moduleObjectId },
		{ $pull: { favoriteModules: moduleObjectId } },
		{ new: true }
	);

	if (updatedUser) {
		module.favorites = Math.max(0, (module.favorites ?? 0) - 1);
		await module.save();
		syncModuleIndexBackground(moduleId);
	}

	const user = await User.findById(userId).select('favoriteModules').lean();
	const stillFavorited = (user?.favoriteModules ?? []).some((id) => String(id) === moduleId);
	const fresh = await Module.findById(moduleId).select('favorites').lean();

	return {
		favorited: stillFavorited,
		favorites: fresh?.favorites ?? module.favorites ?? 0
	};
}
