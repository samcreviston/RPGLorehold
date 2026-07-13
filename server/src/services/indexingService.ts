import { ensureModulesIndex, modulesIndex } from '../config/meilisearch.js';
import { Module, type ModuleDocument } from '../models/Module.js';
import { User } from '../models/User.js';
import type { ModuleSearchDocument } from '../types/searchTypes.js';

let indexReady: Promise<void> | null = null;

async function ensureIndexReady(): Promise<void> {
	if (!indexReady) {
		indexReady = ensureModulesIndex().catch((error) => {
			indexReady = null;
			throw error;
		});
	}
	await indexReady;
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
