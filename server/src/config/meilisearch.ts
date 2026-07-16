import { MeiliSearch } from 'meilisearch';
import { env } from './env.js';

export const MODULES_INDEX = 'modules';
export const CONTENTS_INDEX = 'contents';

const meiliConfig: { host: string; apiKey?: string } = {
	host: env.MEILISEARCH_HOST
};
if (env.MEILISEARCH_API_KEY) {
	meiliConfig.apiKey = env.MEILISEARCH_API_KEY;
}

export const meiliClient = new MeiliSearch(meiliConfig);

export function modulesIndex() {
	return meiliClient.index(MODULES_INDEX);
}

export function contentsIndex() {
	return meiliClient.index(CONTENTS_INDEX);
}

function isIndexAlreadyExists(error: unknown): boolean {
	if (typeof error === 'object' && error && 'code' in error) {
		return String((error as { code?: string }).code) === 'index_already_exists';
	}
	const message = error instanceof Error ? error.message : String(error);
	return /already exists|index_already_exists/i.test(message);
}

export async function ensureModulesIndex(): Promise<void> {
	try {
		await meiliClient.createIndex(MODULES_INDEX, { primaryKey: 'id' });
	} catch (error) {
		if (!isIndexAlreadyExists(error)) {
			throw error;
		}
	}

	const index = modulesIndex();
	await index.updateSettings({
		searchableAttributes: [
			'title',
			'flavorText',
			'tags',
			'adventureTitles',
			'sectionText',
			'linkedContentLabels',
			'authorUsername',
			'biomes',
			'alignments',
			'playstyle'
		],
		filterableAttributes: [
			'authorUsername',
			'playstyle',
			'alignments',
			'biomes',
			'tags',
			'startingLevel',
			'endingLevel',
			'numberOfAdventures'
		],
		sortableAttributes: [
			'publishedAt',
			'views',
			'favorites',
			'averageRating',
			'startingLevel',
			'endingLevel',
			'title',
			'numberOfAdventures'
		]
	});
}

export async function ensureContentsIndex(): Promise<void> {
	try {
		await meiliClient.createIndex(CONTENTS_INDEX, { primaryKey: 'id' });
	} catch (error) {
		if (!isIndexAlreadyExists(error)) {
			throw error;
		}
	}

	await contentsIndex().updateSettings({
		searchableAttributes: [
			'title',
			'typeLabel',
			'description',
			'bodyText',
			'authorUsername',
			'category',
			'creatureType',
			'className',
			'spellSchool'
		],
		filterableAttributes: [
			'contentType',
			'searchCategory',
			'authorUsername',
			'rarity',
			'category',
			'damageType',
			'creatureType',
			'alignment',
			'size',
			'className',
			'ancestry',
			'spellSchool',
			'casterType',
			'subclassOf',
			'ritual',
			'concentration',
			'isSimple',
			'stealthDisadvantage',
			'armorClass',
			'strengthRequired',
			'range'
		],
		sortableAttributes: ['publishedAt', 'title', 'level', 'challengeRating']
	});
}
