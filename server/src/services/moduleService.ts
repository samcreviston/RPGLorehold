import mongoose from 'mongoose';
import { Module, type ModuleDocument } from '../models/Module.js';
import type { ModuleStatus, ModuleUpsertInput } from '../types/moduleTypes.js';

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
	await doc.save();
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
	return doc;
}
