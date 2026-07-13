export type ModuleStatus = 'draft' | 'published';

export type SectionType = 'story' | 'dmNote' | 'setting' | 'image';

export type Playstyle = 'More Roleplay' | 'Balanced' | 'More Combat';

export type ModuleSection = {
	id: string;
	type: SectionType;
	order: number;
	content: string;
	imageID: string;
	caption: string;
};

export type ModuleAdventure = {
	id: string;
	order: number;
	title: string;
	summary: string;
	estimatedPlayTime: number;
	sections: ModuleSection[];
};

export type ModuleUpsertPayload = {
	title: string;
	flavorText: string;
	startingLevel: number;
	endingLevel: number;
	playstyle: Playstyle;
	alignments: string[];
	biomes: string[];
	coverImage: string | null;
	tags: string[];
	adventures: ModuleAdventure[];
	status?: ModuleStatus;
};

export type ModuleDocument = ModuleUpsertPayload & {
	_id: string;
	authorId: string;
	status: ModuleStatus;
	published: boolean;
	numberOfAdventures: number;
	publishedAt: string | null;
	views: number;
	favorites: number;
	averageRating: number;
	searchText: string;
	createdAt: string;
	updatedAt: string;
};
