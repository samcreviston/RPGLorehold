export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_VISIBILITIES = ['private', 'unlisted', 'public'] as const;
export type ContentVisibility = (typeof CONTENT_VISIBILITIES)[number];

export const CONTENT_SOURCES = ['manual', 'ai', 'open5e'] as const;
export type ContentSource = (typeof CONTENT_SOURCES)[number];

export const CONTENT_TYPES = [
	'campaign',
	'oneshot',
	'adventure',
	'monster',
	'npc',
	'npcStats',
	'premadeCharacter',
	'item',
	'weapon',
	'armor',
	'magicItem',
	'beverageFood',
	'dungeonEnvironmentItem',
	'spell',
	'condition',
	'spellSchool',
	'class',
	'environment',
	'service'
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export type ContentUpsertInput = {
	contentType: ContentType;
	title: string;
	data: Record<string, unknown>;
	source?: ContentSource;
	status?: ContentStatus;
	visibility?: ContentVisibility;
};
