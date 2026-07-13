import { MeiliSearch } from 'meilisearch';
import { env } from './env.js';

export const MODULES_INDEX = 'modules';

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
