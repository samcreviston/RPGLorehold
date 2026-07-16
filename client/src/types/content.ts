export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_VISIBILITIES = ['private', 'unlisted', 'public'] as const;
export type ContentVisibility = (typeof CONTENT_VISIBILITIES)[number];

export type ContentSource = 'manual' | 'ai' | 'open5e';

export type ContentDocument = {
	_id: string;
	ownerId: string;
	contentType: string;
	title: string;
	data: Record<string, unknown>;
	source: ContentSource;
	status: ContentStatus;
	visibility: ContentVisibility;
	slug: string;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ContentUpsertPayload = {
	contentType: string;
	title: string;
	data: Record<string, unknown>;
	source?: ContentSource;
	status?: ContentStatus;
	visibility?: ContentVisibility;
};
