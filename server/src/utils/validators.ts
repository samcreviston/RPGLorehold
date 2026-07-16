import { z } from 'zod';
import { MODULE_STATUSES, PLAYSTYLES, SECTION_TYPES } from '../types/moduleTypes.js';
import {
	CONTENT_SOURCES,
	CONTENT_STATUSES,
	CONTENT_TYPES,
	CONTENT_VISIBILITIES
} from '../types/contentTypes.js';

const sectionSchema = z.object({
	id: z.string().min(1),
	type: z.enum(SECTION_TYPES),
	order: z.number().int().min(0),
	content: z.string().optional().default(''),
	imageID: z.string().optional().default(''),
	caption: z.string().optional().default('')
});

const adventureSchema = z.object({
	id: z.string().min(1),
	order: z.number().int().min(0),
	title: z.string().min(1),
	summary: z.string().optional().default(''),
	estimatedPlayTime: z.number().min(0).optional().default(0),
	sections: z.array(sectionSchema).default([])
});

export const moduleUpsertSchema = z
	.object({
		title: z.string().trim().min(1, 'Title is required'),
		flavorText: z.string().max(100).optional().default(''),
		startingLevel: z.number().int().min(1).max(20),
		endingLevel: z.number().int().min(1).max(20),
		playstyle: z.enum(PLAYSTYLES),
		alignments: z.array(z.string()).optional().default([]),
		biomes: z.array(z.string()).optional().default([]),
		coverImage: z.string().nullable().optional().default(null),
		tags: z.array(z.string()).optional().default([]),
		adventures: z.array(adventureSchema).min(1, 'At least one adventure is required'),
		status: z.enum(MODULE_STATUSES).optional()
	})
	.refine((data) => data.endingLevel >= data.startingLevel, {
		message: 'endingLevel must be greater than or equal to startingLevel',
		path: ['endingLevel']
	})
	.superRefine((data, context) => {
		const adventureIds = new Set<string>();
		const sectionIds = new Set<string>();

		data.adventures.forEach((adventure, adventureIndex) => {
			if (adventureIds.has(adventure.id)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['adventures', adventureIndex, 'id'],
					message: 'Adventure IDs must be unique'
				});
			}
			adventureIds.add(adventure.id);

			adventure.sections.forEach((section, sectionIndex) => {
				if (sectionIds.has(section.id)) {
					context.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['adventures', adventureIndex, 'sections', sectionIndex, 'id'],
						message: 'Section IDs must be unique'
					});
				}
				sectionIds.add(section.id);
			});
		});
	});

export type ModuleUpsertBody = z.infer<typeof moduleUpsertSchema>;

const campaignEntrySchema = z
	.object({
		id: z.string().trim().min(1),
		moduleId: z.string().trim().min(1),
		plannedStartingLevel: z.number().int().min(1).max(20),
		plannedEndingLevel: z.number().int().min(1).max(20),
		dmNotes: z.string().max(10000).optional().default('')
	})
	.refine((data) => data.plannedEndingLevel >= data.plannedStartingLevel, {
		message: 'plannedEndingLevel must be greater than or equal to plannedStartingLevel',
		path: ['plannedEndingLevel']
	});

export const campaignCreateSchema = z.object({
	title: z.string().trim().min(1, 'Campaign name is required').max(120)
});

export const campaignUpsertSchema = z.object({
	title: z.string().trim().min(1, 'Campaign name is required').max(120),
	entries: z.array(campaignEntrySchema).default([])
});

export type CampaignCreateBody = z.infer<typeof campaignCreateSchema>;
export type CampaignUpsertBody = z.infer<typeof campaignUpsertSchema>;

export const contentUpsertSchema = z.object({
	contentType: z.enum(CONTENT_TYPES),
	title: z.string().trim().min(1, 'Title is required').max(160),
	data: z.record(z.unknown()).default({}),
	source: z.enum(CONTENT_SOURCES).optional().default('manual'),
	status: z.enum(CONTENT_STATUSES).optional().default('draft'),
	visibility: z.enum(CONTENT_VISIBILITIES).optional().default('private')
}).superRefine((value, context) => {
	const damageTypes = new Set([
		'Piercing', 'Slashing', 'Bludgeoning', 'Acid', 'Cold', 'Fire', 'Force',
		'Lightning', 'Necrotic', 'Poison', 'Psychic', 'Radiant', 'Thunder'
	]);
	const requiredDataFields: Record<string, string[]> = {
		weapon: ['damageDice'],
		armor: ['armorClass'],
		magicItem: ['rarity'],
		spell: ['level', 'school'],
		monster: ['size', 'creatureType', 'armorClass', 'hitPoints', 'speed'],
		npcStats: ['size', 'creatureType', 'armorClass', 'hitPoints', 'speed']
	};
	for (const field of requiredDataFields[value.contentType] ?? []) {
		const fieldValue = value.data[field];
		if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['data', field],
				message: `${field} is required for ${value.contentType}`
			});
		}
	}
	if (value.contentType === 'weapon' && value.data.damageType && !damageTypes.has(String(value.data.damageType))) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['data', 'damageType'], message: 'Invalid damage type' });
	}
	if (value.contentType === 'armor') {
		const armorClass = Number(value.data.armorClass);
		if (!Number.isInteger(armorClass) || armorClass < 10 || armorClass > 20) {
			context.addIssue({ code: z.ZodIssueCode.custom, path: ['data', 'armorClass'], message: 'Armor class must be between 10 and 20' });
		}
		if (value.data.addsDexterityModifier === true) {
			const maxDex = Number(value.data.maxDexterityModifier);
			if (!Number.isInteger(maxDex) || maxDex < 1 || maxDex > 5) {
				context.addIssue({ code: z.ZodIssueCode.custom, path: ['data', 'maxDexterityModifier'], message: 'Maximum Dexterity Modifier must be between 1 and 5' });
			}
		}
	}
});

export type ContentUpsertBody = z.infer<typeof contentUpsertSchema>;
