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
	numberOfAdventures?: number;
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
