import { z } from 'zod';
import type { AiContentType } from '../types/aiTypes.js';

const nonEmptyText = z.string().trim().min(1);
const effectSchema = z.object({
	name: nonEmptyText,
	description: nonEmptyText
});

const itemBaseSchema = z.object({
	name: nonEmptyText,
	rarity: nonEmptyText,
	description: nonEmptyText,
	effects: z.array(effectSchema)
});

const itemSchema = z.discriminatedUnion('itemType', [
	itemBaseSchema.extend({ itemType: z.literal('item') }).passthrough(),
	itemBaseSchema.extend({
		itemType: z.literal('weapon'),
		damageDice: nonEmptyText,
		damageType: nonEmptyText
	}).passthrough(),
	itemBaseSchema.extend({
		itemType: z.literal('armor'),
		armorClass: z.union([z.number().finite(), nonEmptyText])
	}).passthrough()
]);

const statBlockSchema = z.object({
	name: nonEmptyText,
	size: nonEmptyText,
	type: nonEmptyText,
	alignment: nonEmptyText,
	armorClass: z.union([z.number().finite(), nonEmptyText]),
	hitPoints: z.union([z.number().finite(), nonEmptyText]),
	speed: nonEmptyText,
	abilityScores: z.object({
		strength: z.number().int().min(1).max(30),
		dexterity: z.number().int().min(1).max(30),
		constitution: z.number().int().min(1).max(30),
		intelligence: z.number().int().min(1).max(30),
		wisdom: z.number().int().min(1).max(30),
		charisma: z.number().int().min(1).max(30)
	}),
	description: nonEmptyText,
	effects: z.array(effectSchema),
	actions: z.array(effectSchema)
}).passthrough();

const npcStorySchema = z.object({
	name: nonEmptyText,
	description: nonEmptyText,
	personality: nonEmptyText,
	ideals: nonEmptyText,
	bonds: nonEmptyText,
	flaws: nonEmptyText,
	effects: z.array(effectSchema).default([])
}).passthrough();

const npcFullSchema = npcStorySchema.extend({
	stats: statBlockSchema
});

const spellSchema = z.object({
	name: nonEmptyText,
	level: z.union([z.number().int().min(0).max(9), nonEmptyText]),
	school: nonEmptyText,
	castingTime: nonEmptyText,
	range: nonEmptyText,
	duration: nonEmptyText,
	components: nonEmptyText,
	description: nonEmptyText,
	effects: z.array(effectSchema)
}).passthrough();

export function validateStructuredResponse(
	contentType: AiContentType,
	value: unknown
): Record<string, unknown> {
	const schema = (() => {
		switch (contentType) {
			case 'item':
			case 'weapon':
			case 'armor':
				return itemSchema;
			case 'monster':
			case 'npcStats':
				return statBlockSchema;
			case 'npcStory':
				return npcStorySchema;
			case 'npcFull':
				return npcFullSchema;
			case 'spell':
				return spellSchema;
		}
	})();

	return schema.parse(value);
}
