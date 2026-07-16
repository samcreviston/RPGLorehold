export type ModuleSearchDocument = {
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

export type SearchModulesQuery = {
	q: string;
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
	page: number;
	limit: number;
};

export type SearchModulesResult = {
	hits: ModuleSearchDocument[];
	query: string;
	limit: number;
	offset: number;
	estimatedTotalHits: number;
};

export const CONTENT_SEARCH_CATEGORIES = ['creatureNpc', 'allItems', 'other'] as const;
export type ContentSearchCategory = (typeof CONTENT_SEARCH_CATEGORIES)[number];

export type ContentSearchDocument = {
	id: string;
	slug: string;
	contentType: string;
	searchCategory: ContentSearchCategory;
	title: string;
	typeLabel: string;
	description: string;
	bodyText: string;
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
	ritual?: boolean;
	concentration?: boolean;
	hitDice?: string;
	casterType?: string;
	subclassOf?: string;
	detail?: string;
};

export type SearchContentsQuery = {
	q: string;
	category: ContentSearchCategory;
	contentTypes: string[];
	authorUsername?: string | undefined;
	size?: string | undefined;
	creatureType?: string | undefined;
	alignment?: string | undefined;
	className?: string | undefined;
	ancestry?: string | undefined;
	rarity?: string | undefined;
	itemCategory?: string | undefined;
	damageType?: string | undefined;
	range?: string | undefined;
	armorClass?: string | undefined;
	strengthRequired?: number | undefined;
	spellSchool?: string | undefined;
	casterType?: string | undefined;
	subclassOf?: string | undefined;
	ritual?: boolean | undefined;
	concentration?: boolean | undefined;
	sort?: string | undefined;
	page: number;
	limit: number;
};

export type SearchContentsResult = {
	hits: ContentSearchDocument[];
	query: string;
	limit: number;
	offset: number;
	estimatedTotalHits: number;
};
