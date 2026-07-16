export const templateTypeOptions = [
	{ key: 'module', label: 'Module' },
	{ key: 'campaign', label: 'Campaign' },
	{ key: 'oneshot', label: 'One-shot' },
	{ key: 'adventure', label: 'Adventure' },
	{ key: 'monster', label: 'Monster' },
	{ key: 'npc', label: 'NPC (Story Only)' },
	{ key: 'npcStats', label: 'NPC (Story & Stats)' },
	{ key: 'premadeCharacter', label: 'Pre-made Character' },
	{ key: 'weapon', label: 'Weapon' },
	{ key: 'armor', label: 'Armor' },
	{ key: 'magicItem', label: 'Magic Item' },
	{ key: 'beverageFood', label: 'Beverage/Food' },
	{ key: 'dungeonEnvironmentItem', label: 'Dungeon/Environment Item' },
	{ key: 'item', label: 'Item' },
	{ key: 'spell', label: 'Spell' },
	{ key: 'condition', label: 'Condition' },
	{ key: 'spellSchool', label: 'Spell School' },
	{ key: 'class', label: 'Class' },
	{ key: 'environment', label: 'Environment' },
	{ key: 'service', label: 'Service' }
] as const;

export type TemplateTypeKey = (typeof templateTypeOptions)[number]['key'];

export const templateTypeLabelMap: Record<TemplateTypeKey, string> = templateTypeOptions.reduce(
	(accumulator, templateTypeOption) => {
		accumulator[templateTypeOption.key] = templateTypeOption.label;
		return accumulator;
	},
	{} as Record<TemplateTypeKey, string>
);
