import { z } from 'zod';
import { MODULE_STATUSES, PLAYSTYLES, SECTION_TYPES } from '../types/moduleTypes.js';

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
