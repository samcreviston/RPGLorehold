import { apiRequest } from './http';

export type ModuleSearchHit = {
	id: string;
	title: string;
	flavorText: string;
	tags: string[];
	adventureTitles: string[];
	sectionText: string;
	linkedContentLabels: string[];
	authorUsername: string;
	playstyle: string;
	alignments: string[];
	biomes: string[];
	startingLevel: number;
	endingLevel: number;
	numberOfAdventures: number;
	coverImage: string | null;
	views: number;
	favorites: number;
	averageRating: number;
	publishedAt: number | null;
};

export type SearchModulesParams = {
	q?: string;
	playstyle?: string[];
	alignments?: string[];
	biomes?: string[];
	tags?: string[];
	authorUsername?: string;
	adventuresMin?: number;
	adventuresMax?: number;
	levelMin?: number;
	levelMax?: number;
	sort?: string;
	page?: number;
	limit?: number;
};

export type SearchModulesResponse = {
	hits: ModuleSearchHit[];
	query: string;
	limit: number;
	offset: number;
	estimatedTotalHits: number;
};

function toQueryString(params: SearchModulesParams): string {
	const search = new URLSearchParams();
	if (params.q) {
		search.set('q', params.q);
	}
	if (params.playstyle?.length) {
		search.set('playstyle', params.playstyle.join(','));
	}
	if (params.alignments?.length) {
		search.set('alignments', params.alignments.join(','));
	}
	if (params.biomes?.length) {
		search.set('biomes', params.biomes.join(','));
	}
	if (params.tags?.length) {
		search.set('tags', params.tags.join(','));
	}
	if (params.authorUsername) {
		search.set('authorUsername', params.authorUsername);
	}
	if (typeof params.adventuresMin === 'number') {
		search.set('adventuresMin', String(params.adventuresMin));
	}
	if (typeof params.adventuresMax === 'number') {
		search.set('adventuresMax', String(params.adventuresMax));
	}
	if (typeof params.levelMin === 'number') {
		search.set('levelMin', String(params.levelMin));
	}
	if (typeof params.levelMax === 'number') {
		search.set('levelMax', String(params.levelMax));
	}
	if (params.sort) {
		search.set('sort', params.sort);
	}
	if (typeof params.page === 'number') {
		search.set('page', String(params.page));
	}
	if (typeof params.limit === 'number') {
		search.set('limit', String(params.limit));
	}
	const qs = search.toString();
	return qs ? `?${qs}` : '';
}

export async function searchModules(
	params: SearchModulesParams = {}
): Promise<SearchModulesResponse> {
	return apiRequest<SearchModulesResponse>(`/search${toQueryString(params)}`);
}
