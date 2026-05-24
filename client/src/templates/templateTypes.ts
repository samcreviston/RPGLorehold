export const templateTypeOptions = [
	{ key: 'module', label: 'Module' },
	{ key: 'campaign', label: 'Campaign' },
	{ key: 'oneshot', label: 'One-shot' },
	{ key: 'adventure', label: 'Adventure' },
	{ key: 'world', label: 'World' },
	{ key: 'monster', label: 'Monster' },
	{ key: 'npc', label: 'NPC' },
	{ key: 'premadeCharacter', label: 'Pre-made Character' },
	{ key: 'weapon', label: 'Weapon' },
	{ key: 'armor', label: 'Armor' },
	{ key: 'gear', label: 'Gear' },
	{ key: 'potion', label: 'Potion' },
	{ key: 'magicItem', label: 'Magic Item' },
	{ key: 'beverageFood', label: 'Beverage/Food' },
	{ key: 'dungeonEnvironmentItem', label: 'Dungeon/Environment Item' }
] as const;

export type TemplateTypeKey = (typeof templateTypeOptions)[number]['key'];

export const templateTypeLabelMap: Record<TemplateTypeKey, string> = templateTypeOptions.reduce(
	(accumulator, templateTypeOption) => {
		accumulator[templateTypeOption.key] = templateTypeOption.label;
		return accumulator;
	},
	{} as Record<TemplateTypeKey, string>
);
