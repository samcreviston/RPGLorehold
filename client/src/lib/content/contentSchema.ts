import type { Open5eDetailViewModel } from '../open5e/open5eDetailTypes';
import type { ContentDocument } from '../../types/content';

export type ContentFieldKind = 'text' | 'number' | 'boolean' | 'textarea' | 'select';

export type ContentField = {
	key: string;
	label: string;
	kind: ContentFieldKind;
	required?: boolean;
	options?: readonly string[];
	min?: number;
	max?: number;
	visibleWhen?: { key: string; equals: unknown };
};

export type ContentSchema = {
	label: string;
	description: string;
	fields: ContentField[];
};

const commonFields: ContentField[] = [
	{ key: 'description', label: 'Description', kind: 'textarea', required: true }
];

export const damageTypeOptions = [
	'Piercing',
	'Slashing',
	'Bludgeoning',
	'Acid',
	'Cold',
	'Fire',
	'Force',
	'Lightning',
	'Necrotic',
	'Poison',
	'Psychic',
	'Radiant',
	'Thunder'
] as const;

const armorClassOptions = Array.from({ length: 11 }, (_, index) => String(index + 10));

function schema(label: string, description: string, fields: ContentField[]): ContentSchema {
	return { label, description, fields: [...fields, ...commonFields] };
}

type MonsterAbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

type MonsterAction = {
	name: string;
	description: string;
	descriptionEnabled: boolean;
};

function monsterModifier(score: unknown): string {
	const numericScore = typeof score === 'number' && Number.isFinite(score) ? score : Number(score);
	if (!Number.isFinite(numericScore)) {
		return '—';
	}
	const modifier = Math.floor((numericScore - 10) / 2);
	return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function normalizeMonsterAbilityScores(input: Record<string, unknown>): Record<MonsterAbilityKey, number | ''> {
	const rawScores =
		input.abilityScores && typeof input.abilityScores === 'object' && !Array.isArray(input.abilityScores)
			? (input.abilityScores as Record<string, unknown>)
			: {};

	const pickScore = (...keys: string[]): number | '' => {
		for (const key of keys) {
			const value = rawScores[key] ?? input[key];
			if (typeof value === 'number' && Number.isFinite(value)) {
				return value;
			}
			if (typeof value === 'string' && value.trim() !== '') {
				const parsed = Number(value);
				if (Number.isFinite(parsed)) {
					return parsed;
				}
			}
		}
		return '';
	};

	return {
		str: pickScore('str', 'strength'),
		dex: pickScore('dex', 'dexterity'),
		con: pickScore('con', 'constitution'),
		int: pickScore('int', 'intelligence'),
		wis: pickScore('wis', 'wisdom'),
		cha: pickScore('cha', 'charisma')
	};
}

function normalizeMonsterActions(input: unknown): MonsterAction[] {
	if (typeof input === 'string') {
		return input
			.split(/\n\s*\n+/)
			.map((block) => block.trim())
			.filter(Boolean)
			.map((block, index) => {
				const separatorIndex = block.indexOf(':');
				if (separatorIndex > 0) {
					return {
						name: block.slice(0, separatorIndex).trim(),
						description: block.slice(separatorIndex + 1).trim(),
						descriptionEnabled: true
					};
				}
				return {
					name: `Action ${index + 1}`,
					description: block,
					descriptionEnabled: true
				};
			});
	}

	if (!Array.isArray(input)) {
		return [];
	}

	return input.flatMap((entry, index) => {
		if (typeof entry === 'string') {
			const text = entry.trim();
			if (!text) {
				return [];
			}
			const separatorIndex = text.indexOf(':');
			if (separatorIndex > 0) {
				return [
					{
						name: text.slice(0, separatorIndex).trim(),
						description: text.slice(separatorIndex + 1).trim(),
						descriptionEnabled: true
					}
				];
			}
			return [
				{
					name: `Action ${index + 1}`,
					description: text,
					descriptionEnabled: true
				}
			];
		}
		if (!entry || typeof entry !== 'object') {
			return [];
		}
		const record = entry as {
			name?: unknown;
			description?: unknown;
			desc?: unknown;
			descriptionEnabled?: unknown;
			hasDescription?: unknown;
		};
		const name = typeof record.name === 'string' && record.name.trim() ? record.name.trim() : `Action ${index + 1}`;
		const description =
			typeof record.description === 'string'
				? record.description.trim()
				: typeof record.desc === 'string'
					? record.desc.trim()
					: '';
		const descriptionEnabled =
			typeof record.descriptionEnabled === 'boolean'
				? record.descriptionEnabled
				: typeof record.hasDescription === 'boolean'
					? record.hasDescription
					: description.length > 0;
		return [{ name, description, descriptionEnabled }];
	});
}

export const contentSchemaByType: Record<string, ContentSchema> = {
	campaign: schema('Campaign', 'A persistent campaign outline.', [
		{ key: 'setting', label: 'Setting', kind: 'text' },
		{ key: 'startingLevel', label: 'Starting Level', kind: 'number' }
	]),
	oneshot: schema('One-shot', 'A self-contained adventure.', [
		{ key: 'estimatedPlayTime', label: 'Estimated Play Time', kind: 'text' },
		{ key: 'startingLevel', label: 'Starting Level', kind: 'number' }
	]),
	adventure: schema('Adventure', 'An adventure for a party.', [
		{ key: 'recommendedLevel', label: 'Recommended Level', kind: 'text' },
		{ key: 'estimatedPlayTime', label: 'Estimated Play Time', kind: 'text' }
	]),
	monster: schema('Monster', 'A 5e creature stat block.', [
		{ key: 'size', label: 'Size', kind: 'text' },
		{ key: 'creatureType', label: 'Creature Type', kind: 'text' },
		{ key: 'alignment', label: 'Alignment', kind: 'text' },
		{ key: 'armorClass', label: 'Armor Class', kind: 'text' },
		{ key: 'hitPoints', label: 'Hit Points', kind: 'text' },
		{ key: 'speed', label: 'Speed', kind: 'text' },
		{ key: 'challengeRating', label: 'Challenge Rating', kind: 'text' },
		{ key: 'actions', label: 'Actions', kind: 'textarea' }
	]),
	npc: schema('NPC', 'A non-player character.', [
		{ key: 'personality', label: 'Personality', kind: 'textarea' },
		{ key: 'ideals', label: 'Ideals', kind: 'textarea' },
		{ key: 'bonds', label: 'Bonds', kind: 'textarea' },
		{ key: 'flaws', label: 'Flaws', kind: 'textarea' }
	]),
	npcStats: schema('NPC', 'A non-player character with story and combat statistics.', [
		{ key: 'personality', label: 'Personality', kind: 'textarea' },
		{ key: 'ideals', label: 'Ideals', kind: 'textarea' },
		{ key: 'bonds', label: 'Bonds', kind: 'textarea' },
		{ key: 'flaws', label: 'Flaws', kind: 'textarea' },
		{ key: 'class', label: 'Class', kind: 'text' },
		{ key: 'level', label: 'Level', kind: 'number' },
		{ key: 'ancestry', label: 'Ancestry', kind: 'text' },
		{ key: 'size', label: 'Size', kind: 'text' },
		{ key: 'creatureType', label: 'Creature Type', kind: 'text' },
		{ key: 'alignment', label: 'Alignment', kind: 'text' },
		{ key: 'armorClass', label: 'Armor Class', kind: 'text' },
		{ key: 'hitPoints', label: 'Hit Points', kind: 'text' },
		{ key: 'speed', label: 'Speed', kind: 'text' },
		{ key: 'challengeRating', label: 'Challenge Rating', kind: 'text' },
		{ key: 'actions', label: 'Actions', kind: 'textarea' }
	]),
	premadeCharacter: schema('Pre-made Character', 'A ready-to-play character.', [
		{ key: 'class', label: 'Class', kind: 'text' },
		{ key: 'level', label: 'Level', kind: 'number' },
		{ key: 'ancestry', label: 'Ancestry', kind: 'text' }
	]),
	item: schema('Item', 'A mundane 5e item.', [
		{ key: 'category', label: 'Category', kind: 'text' },
		{ key: 'weight', label: 'Weight', kind: 'text' },
		{ key: 'cost', label: 'Cost', kind: 'text' }
	]),
	weapon: schema('Weapon', 'A 5e weapon.', [
		{ key: 'damageDice', label: 'Damage', kind: 'text', required: true },
		{ key: 'damageType', label: 'Damage Type', kind: 'select', options: damageTypeOptions },
		{ key: 'range', label: 'Range', kind: 'text' },
		{ key: 'isSimple', label: 'Simple Weapon', kind: 'boolean' }
	]),
	armor: schema('Armor', 'A 5e armor entry.', [
		{ key: 'armorClass', label: 'Armor Class', kind: 'select', options: armorClassOptions, required: true },
		{ key: 'addsDexterityModifier', label: '+ Dexterity Modifier', kind: 'boolean' },
		{
			key: 'maxDexterityModifier',
			label: 'Maximum Dexterity Modifier',
			kind: 'number',
			min: 1,
			max: 5,
			visibleWhen: { key: 'addsDexterityModifier', equals: true }
		},
		{ key: 'category', label: 'Category', kind: 'text' },
		{ key: 'strengthRequired', label: 'Strength Required', kind: 'number' },
		{ key: 'stealthDisadvantage', label: 'Stealth Disadvantage', kind: 'boolean' }
	]),
	magicItem: schema('Magic Item', 'A magical 5e item.', [
		{ key: 'category', label: 'Category', kind: 'text' },
		{ key: 'rarity', label: 'Rarity', kind: 'text', required: true },
		{ key: 'attunement', label: 'Attunement', kind: 'text' },
		{ key: 'cost', label: 'Cost', kind: 'text' }
	]),
	beverageFood: schema('Beverage/Food', 'Food or drink for the setting.', [
		{ key: 'serving', label: 'Serving', kind: 'text' },
		{ key: 'cost', label: 'Cost', kind: 'text' }
	]),
	dungeonEnvironmentItem: schema('Dungeon/Environment Item', 'A location or environmental feature.', [
		{ key: 'environment', label: 'Environment', kind: 'text' },
		{ key: 'challenge', label: 'Challenge', kind: 'text' }
	]),
	spell: schema('Spell', 'A 5e spell.', [
		{ key: 'level', label: 'Level', kind: 'number', required: true },
		{ key: 'school', label: 'School', kind: 'text', required: true },
		{ key: 'castingTime', label: 'Casting Time', kind: 'text' },
		{ key: 'range', label: 'Range', kind: 'text' },
		{ key: 'duration', label: 'Duration', kind: 'text' },
		{ key: 'components', label: 'Components', kind: 'text' },
		{ key: 'ritual', label: 'Ritual', kind: 'boolean' },
		{ key: 'concentration', label: 'Concentration', kind: 'boolean' },
		{ key: 'higherLevel', label: 'At Higher Levels', kind: 'textarea' }
	]),
	condition: schema('Condition', 'A 5e condition.', []),
	spellSchool: schema('Spell School', 'A school of magic.', []),
	class: schema('Class', 'A 5e class or subclass.', [
		{ key: 'hitDice', label: 'Hit Dice', kind: 'text' },
		{ key: 'casterType', label: 'Caster Type', kind: 'text' },
		{ key: 'subclassOf', label: 'Subclass Of', kind: 'text' },
		{ key: 'features', label: 'Features', kind: 'textarea' }
	]),
	environment: schema('Environment', 'A 5e environment.', [
		{ key: 'aquatic', label: 'Aquatic', kind: 'boolean' },
		{ key: 'planar', label: 'Planar', kind: 'boolean' },
		{ key: 'interior', label: 'Interior', kind: 'boolean' }
	]),
	service: schema('Service', 'A 5e service.', [
		{ key: 'cost', label: 'Cost', kind: 'text' },
		{ key: 'detail', label: 'Detail', kind: 'text' }
	])
};

export function contentSchemaFor(type: string): ContentSchema {
	return contentSchemaByType[type] ?? schema('Content', 'Homebrew content.', []);
}

export function normalizeContentData(type: string, input: Record<string, unknown>): Record<string, unknown> {
	const data = { ...input };
	if (type === 'npcStats' && input.stats && typeof input.stats === 'object' && !Array.isArray(input.stats)) {
		Object.assign(data, input.stats as Record<string, unknown>);
	}
	if (type === 'monster' || type === 'npcStats') {
		data.creatureType ??= data.type;
		data.challengeRating ??= data.challenge;
		data.abilityScores = normalizeMonsterAbilityScores(data);
		data.actions = normalizeMonsterActions(data.actions);
	}
	return data;
}

export function contentToDetailView(content: Pick<ContentDocument, 'title' | 'contentType' | 'data'>): Open5eDetailViewModel {
	const definition = contentSchemaFor(content.contentType);
	if (content.contentType === 'monster' || content.contentType === 'npcStats') {
		const normalized = normalizeContentData(content.contentType, content.data);
		const abilityScores = normalized.abilityScores as Record<string, number | ''> | undefined;
		const actions = Array.isArray(normalized.actions)
			? (normalized.actions as Array<{ name?: unknown; description?: unknown; desc?: unknown }>)
					.map((action, index) => ({
						name:
							typeof action.name === 'string' && action.name.trim()
								? action.name.trim()
								: `Action ${index + 1}`,
						desc:
							typeof action.description === 'string'
								? action.description.trim()
								: typeof action.desc === 'string'
									? action.desc.trim()
									: ''
					}))
					.filter((action) => action.name.length > 0 || action.desc.length > 0)
			: [];

		const abilityLine = (label: string, key: string): { label: string; value: string } | null => {
			const score = abilityScores?.[key];
			if (score === '' || score === undefined || score === null || Number.isNaN(score)) {
				return null;
			}
			return {
				label,
				value: `${score} (${monsterModifier(score)})`
			};
		};

		const lines = [
			{ label: 'Size', value: String(normalized.size || '—') },
			{ label: 'Creature Type', value: String(normalized.creatureType || normalized.type || '—') },
			{ label: 'Alignment', value: String(normalized.alignment || '—') },
			{ label: 'Armor Class', value: String(normalized.armorClass || '—') },
			{ label: 'Hit Points', value: String(normalized.hitPoints || '—') },
			{ label: 'Speed', value: String(normalized.speed || '—') },
			abilityLine('Strength', 'str'),
			abilityLine('Dexterity', 'dex'),
			abilityLine('Constitution', 'con'),
			abilityLine('Intelligence', 'int'),
			abilityLine('Wisdom', 'wis'),
			abilityLine('Charisma', 'cha'),
			{ label: 'Challenge Rating', value: String(normalized.challengeRating || '—') }
		].filter((line): line is { label: string; value: string } => line !== null);

		return {
			title: content.title || 'Untitled Content',
			subtitle: definition.label,
			lines,
			description: typeof normalized.description === 'string' ? normalized.description : '',
			sections: actions.length
				? [
						{
							title: 'Actions',
							blocks: actions.map((action) => ({ name: action.name, desc: action.desc }))
						}
					]
				: []
		};
	}
	return {
		title: content.title || 'Untitled Content',
		subtitle: definition.label,
		lines: definition.fields
			.filter((field) => field.key !== 'description' && content.data[field.key] !== '' && content.data[field.key] != null)
			.map((field) => ({
				label: field.label,
				value: content.data[field.key] === true ? 'Yes' : content.data[field.key] === false ? 'No' : String(content.data[field.key])
			})),
		description: typeof content.data.description === 'string' ? content.data.description : '',
		sections: []
	};
}
