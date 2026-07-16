import {
	contentsIndex,
	ensureContentsIndex,
	ensureModulesIndex,
	modulesIndex
} from '../config/meilisearch.js';
import type {
	ContentSearchDocument,
	SearchContentsQuery,
	SearchContentsResult,
	ModuleSearchDocument,
	SearchModulesQuery,
	SearchModulesResult
} from '../types/searchTypes.js';

const ALLOWED_SORTS = new Set([
	'publishedAt:asc',
	'publishedAt:desc',
	'views:asc',
	'views:desc',
	'favorites:asc',
	'favorites:desc',
	'averageRating:asc',
	'averageRating:desc',
	'startingLevel:asc',
	'startingLevel:desc',
	'endingLevel:asc',
	'endingLevel:desc',
	'title:asc',
	'title:desc',
	'numberOfAdventures:asc',
	'numberOfAdventures:desc'
]);

function quoteFilterValue(value: string): string {
	return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function multiEqualsFilter(attribute: string, values: string[] | undefined): string | null {
	if (!values || values.length === 0) {
		return null;
	}
	if (values.length === 1) {
		return `${attribute} = ${quoteFilterValue(values[0]!)}`;
	}
	return values.map((value) => `${attribute} = ${quoteFilterValue(value)}`).join(' OR ');
}

function buildFilter(query: SearchModulesQuery): string | undefined {
	const parts: string[] = [];

	const playstyle = multiEqualsFilter('playstyle', query.playstyle);
	if (playstyle) {
		parts.push(`(${playstyle})`);
	}

	for (const [attribute, values] of [
		['alignments', query.alignments],
		['biomes', query.biomes],
		['tags', query.tags]
	] as const) {
		const filter = multiEqualsFilter(attribute, values);
		if (filter) {
			parts.push(`(${filter})`);
		}
	}

	if (query.authorUsername) {
		parts.push(`authorUsername = ${quoteFilterValue(query.authorUsername)}`);
	}

	if (typeof query.adventuresMin === 'number') {
		parts.push(`numberOfAdventures >= ${query.adventuresMin}`);
	}
	if (typeof query.adventuresMax === 'number') {
		parts.push(`numberOfAdventures <= ${query.adventuresMax}`);
	}

	if (typeof query.levelMin === 'number') {
		parts.push(`endingLevel >= ${query.levelMin}`);
	}
	if (typeof query.levelMax === 'number') {
		parts.push(`startingLevel <= ${query.levelMax}`);
	}

	return parts.length > 0 ? parts.join(' AND ') : undefined;
}

export async function searchModules(query: SearchModulesQuery): Promise<SearchModulesResult> {
	await ensureModulesIndex();

	const offset = Math.max(0, (query.page - 1) * query.limit);
	const filter = buildFilter(query);
	const sort =
		query.sort && query.sort !== 'relevance' && ALLOWED_SORTS.has(query.sort)
			? [query.sort]
			: undefined;

	const searchParams: {
		offset: number;
		limit: number;
		filter?: string;
		sort?: string[];
	} = {
		offset,
		limit: query.limit
	};
	if (filter) {
		searchParams.filter = filter;
	}
	if (sort) {
		searchParams.sort = sort;
	}

	console.log('[meilisearch] search request', {
		q: query.q,
		filter: searchParams.filter ?? null,
		sort: searchParams.sort ?? null,
		offset: searchParams.offset,
		limit: searchParams.limit
	});

	const result = await modulesIndex().search<ModuleSearchDocument>(query.q, searchParams);
	const estimatedTotalHits = result.estimatedTotalHits ?? result.hits.length;

	console.log('[meilisearch] search result', {
		q: query.q,
		estimatedTotalHits,
		hitCount: result.hits.length,
		hitIds: result.hits.map((hit) => hit.id),
		hitTitles: result.hits.map((hit) => hit.title)
	});

	return {
		hits: result.hits,
		query: query.q,
		limit: query.limit,
		offset,
		estimatedTotalHits
	};
}

const CONTENT_ALLOWED_SORTS = new Set([
	'publishedAt:asc',
	'publishedAt:desc',
	'title:asc',
	'title:desc',
	'level:asc',
	'level:desc',
	'challengeRating:asc',
	'challengeRating:desc'
]);

function contentFilter(query: SearchContentsQuery): string {
	const types = query.contentTypes.map((type) => `contentType = ${quoteFilterValue(type)}`);
	const parts = [`searchCategory = ${quoteFilterValue(query.category)}`, `(${types.join(' OR ')})`];
	const values: Array<[string, string | undefined]> = [
		['authorUsername', query.authorUsername],
		['size', query.size],
		['creatureType', query.creatureType],
		['alignment', query.alignment],
		['className', query.className],
		['ancestry', query.ancestry],
		['rarity', query.rarity],
		['category', query.itemCategory],
		['damageType', query.damageType],
		['range', query.range],
		['armorClass', query.armorClass],
		['spellSchool', query.spellSchool],
		['casterType', query.casterType],
		['subclassOf', query.subclassOf]
	];
	for (const [field, value] of values) {
		if (value) parts.push(`${field} = ${quoteFilterValue(value)}`);
	}
	if (query.ritual !== undefined) parts.push(`ritual = ${query.ritual}`);
	if (query.concentration !== undefined) parts.push(`concentration = ${query.concentration}`);
	if (query.strengthRequired !== undefined) parts.push(`strengthRequired = ${query.strengthRequired}`);
	return parts.join(' AND ');
}

export async function searchContents(query: SearchContentsQuery): Promise<SearchContentsResult> {
	await ensureContentsIndex();
	const offset = Math.max(0, (query.page - 1) * query.limit);
	const sort =
		query.sort && query.sort !== 'relevance' && CONTENT_ALLOWED_SORTS.has(query.sort)
			? [query.sort]
			: undefined;
	const result = await contentsIndex().search<ContentSearchDocument>(query.q, {
		offset,
		limit: query.limit,
		filter: contentFilter(query),
		...(sort ? { sort } : {})
	});
	return {
		hits: result.hits,
		query: query.q,
		limit: query.limit,
		offset,
		estimatedTotalHits: result.estimatedTotalHits ?? result.hits.length
	};
}
