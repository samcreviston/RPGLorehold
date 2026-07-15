import type { AiCategory, AiTemplate } from '../types/aiTypes.js';

export const AI_TEMPLATES: readonly AiTemplate[] = [
	{ id: 'edit-paragraph', label: 'Edit Paragraph', category: 'writing', outputMode: 'text', maxOutputTokens: 800, instructions: 'Edit the supplied paragraph for clarity, grammar, and evocative fantasy prose. Return only the revised paragraph.' },
	{ id: 'edit-adventure', label: 'Edit Adventure', category: 'writing', outputMode: 'text', maxOutputTokens: 2000, instructions: 'Edit the supplied adventure material for clarity, structure, consistency, and table usability. Return only the revised adventure text.' },
	{ id: 'generate-paragraph', label: 'Generate Paragraph', category: 'writing', outputMode: 'text', maxOutputTokens: 800, instructions: 'Write one polished, game-ready fantasy paragraph satisfying the request. Return only that paragraph.' },
	{ id: 'generate-adventure', label: 'Generate Adventure', category: 'writing', outputMode: 'text', maxOutputTokens: 2000, instructions: 'Generate concise, playable fantasy adventure material satisfying the request. Return only the adventure text.' },
	{ id: 'non-magic-item', label: 'Non-Magic Item Creation', category: 'content', outputMode: 'structured', contentType: 'item', maxOutputTokens: 300, instructions: 'Determine whether this is a general item, weapon, or armor. Return the matching JSON object only.' },
	{ id: 'magic-item', label: 'Magic Item Creation', category: 'content', outputMode: 'structured', contentType: 'item', maxOutputTokens: 300, instructions: 'Determine whether this is a general item, weapon, or armor. Return the matching JSON object only.' },
	{ id: 'cursed-item', label: 'Cursed Item Creation', category: 'content', outputMode: 'structured', contentType: 'item', maxOutputTokens: 300, instructions: 'Determine whether this is a general item, weapon, or armor. Include its curse in effects. Return the matching JSON object only.' },
	{ id: 'monster', label: 'Monster Creation', category: 'content', outputMode: 'structured', contentType: 'monster', maxOutputTokens: 800, instructions: 'Return a complete 5e-compatible monster stat block JSON object; NOTHING ELSE, JSON ONLY Do not omit any required fields, do not use markdown, and do not include commentary. If a detail is unspecified, infer a reasonable fantasy value rather than leaving it blank.' },
	{ id: 'npc-story', label: 'NPC (Story-only) Creation', category: 'content', outputMode: 'structured', contentType: 'npcStory', maxOutputTokens: 500, instructions: 'Return an NPC story profile JSON object only; NOTHING ELSE, JSON ONLY.' },
	{ id: 'npc-stats', label: 'NPC (Stats-only) Creation', category: 'content', outputMode: 'structured', contentType: 'npcStats', maxOutputTokens: 800, instructions: 'Return a complete 5e-compatible NPC stat block JSON object; NOTHING ELSE, JSON ONLY. Do not omit any required fields, do not use markdown, and do not include commentary. If a detail is unspecified, infer a reasonable fantasy value rather than leaving it blank.' },
	{ id: 'npc-full', label: 'NPC (Stats & Story) Creation', category: 'content', outputMode: 'structured', contentType: 'npcFull', maxOutputTokens: 1000, instructions: 'Return an NPC JSON object with story and a complete 5e-compatible stat block only; NOTHING ELSE, JSON ONLY. Do not omit any required fields, do not use markdown, and do not include commentary. If a detail is unspecified, infer a reasonable fantasy value rather than leaving it blank.' },
	{ id: 'spell', label: 'Spell Creation', category: 'content', outputMode: 'structured', contentType: 'spell', maxOutputTokens: 500, instructions: 'Return a 5e-compatible spell JSON object only; NOTHING ELSE, JSON ONLY.' },
	{ id: 'adventure-idea', label: 'Adventure Idea Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 300, instructions: 'Generate concise, playable adventure ideas. Return only the ideas.' },
	{ id: 'module-idea', label: 'Module Idea Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 300, instructions: 'Generate concise tabletop module ideas. Return only the ideas.' },
	{ id: 'item-name', label: 'Item Name Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 300, instructions: 'Generate evocative item names. Return only the names.' },
	{ id: 'monster-name', label: 'Monster Name Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 300, instructions: 'Generate evocative monster names. Return only the names.' },
	{ id: 'familiar-name', label: 'Familiar Name Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 300, instructions: 'Generate evocative familiar names. Return only the names.' },
	{ id: 'race-name', label: 'Race Name Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 300, instructions: 'Generate evocative fantasy ancestry names. Return only the names.' },
	{ id: 'setting-idea', label: 'Setting Idea Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 500, instructions: 'Generate concise fantasy setting ideas. Return only the ideas.' },
	{ id: 'location-idea', label: 'Location Idea Generator', category: 'ideas', outputMode: 'text', maxOutputTokens: 500, instructions: 'Generate concise fantasy location ideas. Return only the ideas.' }
];

export function getAiTemplate(category: AiCategory, templateId: string): AiTemplate | undefined {
	return AI_TEMPLATES.find((template) => template.category === category && template.id === templateId);
}

export function buildSystemInstructions(template: AiTemplate): string {
	const jsonContract = template.outputMode === 'structured'
		? `Return valid JSON only. Never use markdown fences. ${structuredContract(template.contentType)}`
		: 'Do not include analysis, notes, or markdown fences.';

	return `You are Lair Co-Dragon, a helpful Dungeons & Dragons 5e writing assistant. ${template.instructions} ${jsonContract} Do not claim content is official D&D material.`;
}

function structuredContract(contentType: AiTemplate['contentType']): string {
	switch (contentType) {
		case 'item':
			return 'Include itemType ("item", "weapon", or "armor"), name, rarity, description, and effects (an array of {name, description}). Weapons also require damageDice and damageType. Armor also requires armorClass.';
		case 'monster':
		case 'npcStats':
			return 'Include name, size, type, alignment, armorClass, hitPoints, speed, abilityScores ({strength, dexterity, constitution, intelligence, wisdom, charisma}), description, effects (array of {name, description}), and actions (array of {name, description}).';
		case 'npcFull':
			return 'Include name, description, personality, ideals, bonds, flaws, effects, and stats. stats must be a full stat block with name, size, type, alignment, armorClass, hitPoints, speed, abilityScores, description, effects, and actions.';
		case 'npcStory':
			return 'Include name, description, personality, ideals, bonds, flaws, and effects (an array of {name, description}).';
		case 'spell':
			return 'Include name, level, school, castingTime, range, duration, components, description, and effects (an array of {name, description}).';
		default:
			return 'Return a valid JSON object.';
	}
}
