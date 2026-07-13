export const MODULE_STATUSES = ['draft', 'published'] as const;
export type ModuleStatus = (typeof MODULE_STATUSES)[number];

export const SECTION_TYPES = ['story', 'dmNote', 'setting', 'image'] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const PLAYSTYLES = ['More Roleplay', 'Balanced', 'More Combat'] as const;
export type Playstyle = (typeof PLAYSTYLES)[number];

export type ModuleSectionInput = {
	id: string;
	type: SectionType;
	order: number;
	content?: string;
	imageID?: string;
	caption?: string;
};

export type ModuleAdventureInput = {
	id: string;
	order: number;
	title: string;
	summary?: string;
	estimatedPlayTime?: number;
	sections: ModuleSectionInput[];
};

export type ModuleUpsertInput = {
	title: string;
	flavorText?: string;
	startingLevel: number;
	endingLevel: number;
	playstyle: Playstyle;
	alignments?: string[];
	biomes?: string[];
	coverImage?: string | null;
	tags?: string[];
	adventures: ModuleAdventureInput[];
	status?: ModuleStatus;
};
