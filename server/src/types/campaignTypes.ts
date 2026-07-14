export type CampaignEntryInput = {
	id: string;
	moduleId: string;
	plannedStartingLevel: number;
	plannedEndingLevel: number;
	dmNotes: string;
};

export type CampaignUpsertInput = {
	title: string;
	entries: CampaignEntryInput[];
};
