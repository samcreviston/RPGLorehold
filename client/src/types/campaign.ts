import type { ModuleDocument } from './module';

export type CampaignEntry = {
	id: string;
	moduleId: string;
	plannedStartingLevel: number;
	plannedEndingLevel: number;
	dmNotes: string;
	module: ModuleDocument | null;
	authorUsername: string;
};

export type Campaign = {
	_id: string;
	ownerId: string;
	title: string;
	entries: CampaignEntry[];
	createdAt: string;
	updatedAt: string;
};

export type CampaignUpdatePayload = {
	title: string;
	entries: Array<Pick<
		CampaignEntry,
		'id' | 'moduleId' | 'plannedStartingLevel' | 'plannedEndingLevel' | 'dmNotes'
	>>;
};
