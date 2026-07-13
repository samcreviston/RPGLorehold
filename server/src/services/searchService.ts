import { ensureModulesIndex, modulesIndex } from '../config/meilisearch.js';
import type {
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
