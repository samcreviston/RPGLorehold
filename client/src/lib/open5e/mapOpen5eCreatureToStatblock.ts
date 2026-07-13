import type {
	MappedCreatureStatblock,
	Open5eCreature,
	Open5eNamedDesc,
	StatblockPropertyBlock,
	StatblockPropertyLine
} from './creatureTypes';

const CR_TO_XP: Record<string, number> = {
	'0': 10,
	'1/8': 25,
	'1/4': 50,
	'1/2': 100,
	'1': 200,
	'2': 450,
	'3': 700,
	'4': 1100,
	'5': 1800,
	'6': 2300,
	'7': 2900,
	'8': 3900,
	'9': 5000,
	'10': 5900,
	'11': 7200,
	'12': 8400,
	'13': 10000,
	'14': 11500,
	'15': 13000,
	'16': 15000,
	'17': 18000,
	'18': 20000,
	'19': 22000,
	'20': 25000,
	'21': 33000,
	'22': 41000,
	'23': 50000,
	'24': 62000,
	'25': 75000,
	'26': 90000,
	'27': 105000,
	'28': 120000,
	'29': 135000,
	'30': 155000
};

function formatNumber(value: number): string {
	return value.toLocaleString('en-US');
}

function asNonEmptyString(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null;
	}
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function formatSpeed(speed: Open5eCreature['speed']): string {
	if (!speed) {
		return '—';
	}
	if (typeof speed === 'string') {
		return speed;
	}

	const parts: string[] = [];
	for (const [mode, rawValue] of Object.entries(speed)) {
		if (rawValue === undefined || rawValue === null || rawValue === '') {
			continue;
		}
		const value = typeof rawValue === 'number' ? `${rawValue} ft.` : String(rawValue);
		if (mode === 'walk') {
			parts.push(value.includes('ft') ? value : `${value}`);
			if (typeof rawValue === 'number') {
				parts[parts.length - 1] = `${rawValue} ft.`;
			}
			continue;
		}
		if (typeof rawValue === 'number') {
			parts.push(`${mode} ${rawValue} ft.`);
		} else {
			parts.push(`${mode} ${rawValue}`);
		}
	}

	return parts.length > 0 ? parts.join(', ') : '—';
}

function formatRecordOrString(value: string | Record<string, number | string> | null | undefined): string | null {
	if (!value) {
		return null;
	}
	if (typeof value === 'string') {
		return asNonEmptyString(value);
	}
	const parts = Object.entries(value).map(([key, entryValue]) => `${key} ${entryValue}`);
	return parts.length > 0 ? parts.join(', ') : null;
}

function formatSavingThrows(creature: Open5eCreature): string | null {
	const fromField = formatRecordOrString(creature.saving_throws);
	if (fromField) {
		return fromField;
	}

	const named: Array<[string, number | null | undefined]> = [
		['Str', creature.strength_save],
		['Dex', creature.dexterity_save],
		['Con', creature.constitution_save],
		['Int', creature.intelligence_save],
		['Wis', creature.wisdom_save],
		['Cha', creature.charisma_save]
	];

	const parts = named
		.filter((entry): entry is [string, number] => typeof entry[1] === 'number')
		.map(([label, score]) => `${label} ${score >= 0 ? `+${score}` : score}`);

	return parts.length > 0 ? parts.join(', ') : null;
}

function formatChallenge(creature: Open5eCreature): string | null {
	const crRaw = creature.challenge_rating ?? creature.cr;
	if (crRaw === null || crRaw === undefined || crRaw === '') {
		return null;
	}
	const cr = String(crRaw);
	const xp = CR_TO_XP[cr];
	if (typeof xp === 'number') {
		return `${cr} (${formatNumber(xp)} XP)`;
	}
	return cr;
}

function formatSenses(creature: Open5eCreature): string | null {
	const senses = asNonEmptyString(creature.senses);
	const perception =
		typeof creature.perception === 'number' ? `passive Perception ${creature.perception}` : null;

	if (senses && perception) {
		if (senses.toLowerCase().includes('passive perception')) {
			return senses;
		}
		return `${senses}, ${perception}`;
	}
	return senses ?? perception;
}

function mapNamedBlocks(entries: Open5eNamedDesc[] | null | undefined): StatblockPropertyBlock[] {
	if (!entries || entries.length === 0) {
		return [];
	}
	return entries
		.map((entry) => ({
			name: asNonEmptyString(entry.name) ?? 'Untitled',
			desc: asNonEmptyString(entry.desc) ?? ''
		}))
		.filter((entry) => entry.desc.length > 0 || entry.name !== 'Untitled');
}

function pushLine(
	lines: StatblockPropertyLine[],
	name: string,
	value: string | null | undefined
): void {
	const normalized = asNonEmptyString(value ?? null);
	if (!normalized || normalized === '—') {
		return;
	}
	lines.push({ name, value: normalized });
}

export function mapOpen5eCreatureToStatblock(creature: Open5eCreature): MappedCreatureStatblock {
	const size = asNonEmptyString(creature.size) ?? 'Medium';
	const type = asNonEmptyString(creature.type) ?? 'creature';
	const alignment = asNonEmptyString(creature.alignment) ?? 'unaligned';
	const subtitle = `${size} ${type}, ${alignment}`;

	const armorClassValue = creature.armor_class ?? '—';
	const armorDesc = asNonEmptyString(creature.armor_desc ?? null);
	const armorClass = armorDesc ? `${armorClassValue} (${armorDesc})` : String(armorClassValue);

	const hitPointsValue = creature.hit_points ?? '—';
	const hitDice = asNonEmptyString(creature.hit_dice ?? null);
	const hitPoints = hitDice ? `${hitPointsValue} (${hitDice})` : String(hitPointsValue);

	const propertyLines: StatblockPropertyLine[] = [];
	pushLine(propertyLines, 'Saving Throws', formatSavingThrows(creature));
	pushLine(propertyLines, 'Skills', formatRecordOrString(creature.skills));
	pushLine(propertyLines, 'Damage Vulnerabilities', creature.damage_vulnerabilities);
	pushLine(propertyLines, 'Damage Resistances', creature.damage_resistances);
	pushLine(propertyLines, 'Damage Immunities', creature.damage_immunities);
	pushLine(propertyLines, 'Condition Immunities', creature.condition_immunities);
	pushLine(propertyLines, 'Senses', formatSenses(creature));
	pushLine(propertyLines, 'Languages', creature.languages);
	pushLine(propertyLines, 'Challenge', formatChallenge(creature));

	return {
		name: asNonEmptyString(creature.name) ?? 'Unknown Creature',
		subtitle,
		armorClass,
		hitPoints,
		speed: formatSpeed(creature.speed),
		abilities: {
			str: creature.strength ?? 10,
			dex: creature.dexterity ?? 10,
			con: creature.constitution ?? 10,
			int: creature.intelligence ?? 10,
			wis: creature.wisdom ?? 10,
			cha: creature.charisma ?? 10
		},
		propertyLines,
		traits: mapNamedBlocks(creature.special_abilities),
		actions: mapNamedBlocks(creature.actions),
		bonusActions: mapNamedBlocks(creature.bonus_actions),
		reactions: mapNamedBlocks(creature.reactions),
		legendaryActions: mapNamedBlocks(creature.legendary_actions),
		mythicActions: mapNamedBlocks(creature.mythic_actions),
		lairActions: mapNamedBlocks(creature.lair_actions),
		regionalEffects: mapNamedBlocks(creature.regional_effects)
	};
}
