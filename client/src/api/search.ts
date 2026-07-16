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

export type ContentSearchCategory = 'creatureNpc' | 'allItems' | 'other';

export type ContentSearchHit = {
	id: string;
	slug: string;
	contentType: string;
	searchCategory: ContentSearchCategory;
	title: string;
	typeLabel: string;
	description: string;
	authorUsername: string;
	publishedAt: number | null;
	size?: string;
	creatureType?: string;
	alignment?: string;
	challengeRating?: number;
	armorClass?: string;
	hitPoints?: string;
	className?: string;
	level?: number;
	ancestry?: string;
	category?: string;
	rarity?: string;
	cost?: string;
	weight?: string;
	damageDice?: string;
	damageType?: string;
	range?: string;
	strengthRequired?: number;
	spellSchool?: string;
	castingTime?: string;
	duration?: string;
	hitDice?: string;
	casterType?: string;
	subclassOf?: string;
	detail?: string;
};

export type SearchContentsParams = {
	q?: string;
	category: ContentSearchCategory;
	contentTypes: string[];
	sort?: string;
	authorUsername?: string;
	size?: string;
	creatureType?: string;
	alignment?: string;
	className?: string;
	ancestry?: string;
	rarity?: string;
	itemCategory?: string;
	damageType?: string;
	range?: string;
	armorClass?: string;
	strengthRequired?: string;
	spellSchool?: string;
	casterType?: string;
	subclassOf?: string;
	ritual?: boolean;
	concentration?: boolean;
	limit?: number;
};

export type SearchContentsResponse = Omit<SearchModulesResponse, 'hits'> & {
	hits: ContentSearchHit[];
};

export async function searchContents(params: SearchContentsParams): Promise<SearchContentsResponse> {
	const search = new URLSearchParams({
		category: params.category,
		contentTypes: params.contentTypes.join(','),
		limit: String(params.limit ?? 20)
	});
	for (const [key, value] of Object.entries(params)) {
		if (key !== 'category' && key !== 'contentTypes' && key !== 'limit' && value !== undefined && value !== '') {
			search.set(key, String(value));
		}
	}
	return apiRequest<SearchContentsResponse>(`/search/contents?${search.toString()}`);
}
