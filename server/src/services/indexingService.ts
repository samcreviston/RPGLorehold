import {
	contentsIndex,
	ensureContentsIndex,
	ensureModulesIndex,
	modulesIndex
} from '../config/meilisearch.js';
import { Content, type ContentDocument } from '../models/Content.js';
import { Module, type ModuleDocument } from '../models/Module.js';
import { User } from '../models/User.js';
import type {
	ContentSearchCategory,
	ContentSearchDocument,
	ModuleSearchDocument
} from '../types/searchTypes.js';

let indexReady: Promise<void> | null = null;
let contentsIndexReady: Promise<void> | null = null;

async function ensureIndexReady(): Promise<void> {
	if (!indexReady) {
		indexReady = ensureModulesIndex().catch((error) => {
			indexReady = null;
			throw error;
		});
	}
	await indexReady;
}

async function ensureContentsIndexReady(): Promise<void> {
	if (!contentsIndexReady) {
		contentsIndexReady = ensureContentsIndex().catch((error) => {
			contentsIndexReady = null;
			throw error;
		});
	}
	await contentsIndexReady;
}

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

function extractLinkedContentLabels(html: string): string[] {
	const labels = new Set<string>();
	const tagRe =
		/<span\b[^>]*\bcontent-link-tag\b[^>]*>([\s\S]*?)<\/span>/gi;
	let match: RegExpExecArray | null;
	while ((match = tagRe.exec(html)) !== null) {
		const label = stripHtml(match[1] ?? '');
		if (label) {
			labels.add(label);
		}
	}
	return [...labels];
}

export function toModuleSearchDocument(
	module: ModuleDocument,
	authorUsername: string
): ModuleSearchDocument {
	const adventures = module.adventures ?? [];
	const adventureTitles = adventures.map((adventure) => adventure.title).filter(Boolean);
	const sectionParts: string[] = [];
	const linkedLabels = new Set<string>();

	for (const adventure of adventures) {
		for (const section of adventure.sections ?? []) {
			if (section.caption) {
				sectionParts.push(section.caption);
			}
			if (section.content) {
				sectionParts.push(stripHtml(section.content));
				for (const label of extractLinkedContentLabels(section.content)) {
					linkedLabels.add(label);
				}
			}
		}
	}

	return {
		id: String(module._id),
		title: module.title,
		flavorText: module.flavorText ?? '',
		tags: module.tags ?? [],
		adventureTitles,
		sectionText: sectionParts.filter(Boolean).join(' ').trim(),
		linkedContentLabels: [...linkedLabels],
		authorUsername,
		playstyle: module.playstyle,
		alignments: module.alignments ?? [],
		biomes: module.biomes ?? [],
		startingLevel: module.startingLevel,
		endingLevel: module.endingLevel,
		numberOfAdventures: module.numberOfAdventures ?? adventures.length,
		coverImage: module.coverImage ?? null,
		views: module.views ?? 0,
		favorites: module.favorites ?? 0,
		averageRating: module.averageRating ?? 0,
		publishedAt: module.publishedAt ? new Date(module.publishedAt).getTime() : null
	};
}

async function resolveAuthorUsername(authorId: unknown): Promise<string> {
	const user = await User.findById(authorId).select('username').lean();
	return user?.username ?? '';
}

export async function removeModuleFromIndex(moduleId: string): Promise<void> {
	await ensureIndexReady();
	const task = await modulesIndex().deleteDocument(moduleId).waitTask();
	console.log('[meilisearch] removed from index', { id: moduleId, taskUid: task.uid });
}

export async function syncModuleIndex(moduleId: string): Promise<void> {
	const module = await Module.findById(moduleId);
	if (!module || module.status !== 'published') {
		console.log('[meilisearch] skipping index upsert (not published)', {
			id: moduleId,
			status: module?.status ?? 'missing'
		});
		await removeModuleFromIndex(moduleId).catch(() => undefined);
		return;
	}

	await ensureIndexReady();
	const authorUsername = await resolveAuthorUsername(module.authorId);
	const document = toModuleSearchDocument(module, authorUsername);
	const task = await modulesIndex().addDocuments([document]).waitTask();
	console.log('[meilisearch] created/updated in index', {
		id: document.id,
		title: document.title,
		authorUsername: document.authorUsername,
		taskUid: task.uid
	});
}

export function syncModuleIndexBackground(moduleId: string): void {
	void syncModuleIndex(moduleId).catch((error) => {
		console.error(`[meilisearch] Failed to sync module ${moduleId}:`, error);
	});
}

export function removeModuleFromIndexBackground(moduleId: string): void {
	void removeModuleFromIndex(moduleId).catch((error) => {
		console.error(`[meilisearch] Failed to remove module ${moduleId}:`, error);
	});
}

export async function reindexAllPublishedModules(): Promise<number> {
	await ensureIndexReady();
	const modules = await Module.find({ status: 'published' });
	if (modules.length === 0) {
		const task = await modulesIndex().deleteAllDocuments().waitTask();
		console.log('[meilisearch] reindex cleared empty modules index', { taskUid: task.uid });
		return 0;
	}

	const documents: ModuleSearchDocument[] = [];
	for (const module of modules) {
		const authorUsername = await resolveAuthorUsername(module.authorId);
		documents.push(toModuleSearchDocument(module, authorUsername));
	}

	await modulesIndex().deleteAllDocuments().waitTask();
	const task = await modulesIndex().addDocuments(documents).waitTask();
	console.log('[meilisearch] reindexed published modules', {
		count: documents.length,
		taskUid: task.uid
	});
	return documents.length;
}

const CONTENT_CATEGORY_BY_TYPE: Record<string, ContentSearchCategory> = {
	monster: 'creatureNpc',
	npc: 'creatureNpc',
	npcStats: 'creatureNpc',
	premadeCharacter: 'creatureNpc',
	item: 'allItems',
	weapon: 'allItems',
	armor: 'allItems',
	magicItem: 'allItems',
	beverageFood: 'allItems',
	spell: 'other',
	condition: 'other',
	spellSchool: 'other',
	class: 'other',
	service: 'other'
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
	monster: 'Monster',
	npc: 'NPC',
	npcStats: 'NPC',
	premadeCharacter: 'Pre-made Character',
	item: 'Item',
	weapon: 'Weapon',
	armor: 'Armor',
	magicItem: 'Magic Item',
	beverageFood: 'Beverage/Food',
	spell: 'Spell',
	condition: 'Condition',
	spellSchool: 'Spell School',
	class: 'Class',
	service: 'Service'
};

function value(data: Record<string, unknown>, key: string): string {
	const item = data[key];
	return typeof item === 'string' || typeof item === 'number' ? String(item) : '';
}

function numberValue(data: Record<string, unknown>, key: string): number | undefined {
	const raw = data[key];
	const parsed = typeof raw === 'number' ? raw : Number(raw);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function textValues(data: Record<string, unknown>): string {
	return Object.values(data)
		.flatMap((entry) => {
			if (typeof entry === 'string' || typeof entry === 'number') {
				return [String(entry)];
			}
			if (Array.isArray(entry)) {
				return entry.flatMap((item) =>
					item && typeof item === 'object' ? Object.values(item as Record<string, unknown>) : [String(item)]
				);
			}
			return [];
		})
		.filter((entry): entry is string => typeof entry === 'string')
		.join(' ');
}

export function toContentSearchDocument(
	content: ContentDocument,
	authorUsername: string
): ContentSearchDocument | null {
	const category = CONTENT_CATEGORY_BY_TYPE[content.contentType];
	if (!category) {
		return null;
	}
	const data = (content.data ?? {}) as Record<string, unknown>;
	const document: ContentSearchDocument = {
		id: String(content._id),
		slug: content.slug,
		contentType: content.contentType,
		searchCategory: category,
		title: content.title,
		typeLabel: CONTENT_TYPE_LABELS[content.contentType] ?? content.contentType,
		description: value(data, 'description'),
		bodyText: textValues(data),
		authorUsername,
		publishedAt: content.publishedAt ? new Date(content.publishedAt).getTime() : null
	};
	const fields: Array<[keyof ContentSearchDocument, string]> = [
		['size', 'size'],
		['creatureType', 'creatureType'],
		['alignment', 'alignment'],
		['armorClass', 'armorClass'],
		['hitPoints', 'hitPoints'],
		['className', 'class'],
		['ancestry', 'ancestry'],
		['category', 'category'],
		['rarity', 'rarity'],
		['cost', 'cost'],
		['weight', 'weight'],
		['damageDice', 'damageDice'],
		['damageType', 'damageType'],
		['range', 'range'],
		['spellSchool', 'school'],
		['castingTime', 'castingTime'],
		['duration', 'duration'],
		['hitDice', 'hitDice'],
		['casterType', 'casterType'],
		['subclassOf', 'subclassOf'],
		['detail', 'detail']
	];
	for (const [target, source] of fields) {
		const fieldValue = value(data, source);
		if (fieldValue) {
			Object.assign(document, { [target]: fieldValue });
		}
	}
	const level = numberValue(data, 'level');
	if (level !== undefined) {
		document.level = level;
	}
	const challengeRating = numberValue(data, 'challengeRating');
	if (challengeRating !== undefined) {
		document.challengeRating = challengeRating;
	}
	const strengthRequired = numberValue(data, 'strengthRequired');
	if (strengthRequired !== undefined) {
		document.strengthRequired = strengthRequired;
	}
	if (typeof data.ritual === 'boolean') document.ritual = data.ritual;
	if (typeof data.concentration === 'boolean') document.concentration = data.concentration;
	return document;
}

export async function removeContentFromIndex(contentId: string): Promise<void> {
	await ensureContentsIndexReady();
	await contentsIndex().deleteDocument(contentId).waitTask();
}

export async function syncContentIndex(contentId: string): Promise<void> {
	const content = await Content.findById(contentId);
	if (
		!content ||
		content.status !== 'published' ||
		content.visibility !== 'public' ||
		!CONTENT_CATEGORY_BY_TYPE[content.contentType]
	) {
		await removeContentFromIndex(contentId).catch(() => undefined);
		return;
	}
	const authorUsername = await resolveAuthorUsername(content.ownerId);
	const document = toContentSearchDocument(content, authorUsername);
	if (!document) return;
	await ensureContentsIndexReady();
	await contentsIndex().addDocuments([document]).waitTask();
}

export function syncContentIndexBackground(contentId: string): void {
	void syncContentIndex(contentId).catch((error) => {
		console.error(`[meilisearch] Failed to sync content ${contentId}:`, error);
	});
}

export function removeContentFromIndexBackground(contentId: string): void {
	void removeContentFromIndex(contentId).catch((error) => {
		console.error(`[meilisearch] Failed to remove content ${contentId}:`, error);
	});
}

export async function reindexAllPublicContents(): Promise<number> {
	await ensureContentsIndexReady();
	const contents = await Content.find({ status: 'published', visibility: 'public' });
	const documents: ContentSearchDocument[] = [];
	for (const content of contents) {
		const document = toContentSearchDocument(
			content,
			await resolveAuthorUsername(content.ownerId)
		);
		if (document) documents.push(document);
	}
	await contentsIndex().deleteAllDocuments().waitTask();
	if (documents.length > 0) {
		await contentsIndex().addDocuments(documents).waitTask();
	}
	return documents.length;
}
