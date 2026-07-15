import type { MappedCreatureStatblock, StatblockPropertyBlock } from '../open5e/creatureTypes';
import type { Open5eDetailViewModel } from '../open5e/open5eDetailTypes';

export type GeneratedContentType =
	| 'item'
	| 'weapon'
	| 'armor'
	| 'monster'
	| 'npcStory'
	| 'npcStats'
	| 'npcFull'
	| 'spell';

export type GeneratedContent = {
	contentType: GeneratedContentType;
	data: Record<string, unknown>;
};

export type GeneratedContentPreview =
	| { kind: 'creature'; creature: MappedCreatureStatblock }
	| { kind: 'detail'; detail: Open5eDetailViewModel };

type NamedEffect = { name: string; description: string };

function text(value: unknown, fallback = ''): string {
	return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function displayText(value: unknown, fallback = ''): string {
	return typeof value === 'number' ? String(value) : text(value, fallback);
}

function numberValue(value: unknown, fallback = 10): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function record(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function namedEffects(value: unknown): NamedEffect[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.flatMap((entry) => {
		const effect = record(entry);
		const name = text(effect.name);
		const description = text(effect.description ?? effect.desc);
		return name && description ? [{ name, description }] : [];
	});
}

function toBlocks(value: unknown): StatblockPropertyBlock[] {
	return namedEffects(value).map((effect) => ({ name: effect.name, desc: effect.description }));
}

function addLine(
	lines: Open5eDetailViewModel['lines'],
	label: string,
	value: unknown
): void {
	const normalized = typeof value === 'number' ? String(value) : text(value);
	if (normalized) {
		lines.push({ label, value: normalized });
	}
}

function effectsSection(data: Record<string, unknown>): Open5eDetailViewModel['sections'] {
	const blocks = namedEffects(data.effects).map((effect) => ({
		name: effect.name,
		desc: effect.description
	}));
	return blocks.length ? [{ title: 'Effects', blocks }] : [];
}

function mapItem(data: Record<string, unknown>, contentType: 'item' | 'weapon' | 'armor'): Open5eDetailViewModel {
	const lines: Open5eDetailViewModel['lines'] = [];
	addLine(lines, 'Rarity', data.rarity);
	addLine(lines, 'Category', data.category);
	addLine(lines, 'Weight', data.weight);
	addLine(lines, 'Cost', data.cost);
	addLine(lines, 'Attunement', data.attunement);

	if (contentType === 'weapon') {
		addLine(lines, 'Damage', data.damageDice ?? data.damage);
		addLine(lines, 'Damage Type', data.damageType);
		addLine(lines, 'Range', data.range);
	} else if (contentType === 'armor') {
		addLine(lines, 'Armor Class', data.armorClass ?? data.ac);
		addLine(lines, 'Strength Required', data.strengthRequired);
		addLine(lines, 'Stealth Disadvantage', data.stealthDisadvantage);
	}

	return {
		title: text(data.name, 'Unnamed Content'),
		subtitle: contentType === 'item' ? 'Item' : contentType === 'weapon' ? 'Weapon' : 'Armor',
		lines,
		description: text(data.description),
		sections: effectsSection(data)
	};
}

function mapSpell(data: Record<string, unknown>): Open5eDetailViewModel {
	const lines: Open5eDetailViewModel['lines'] = [];
	addLine(lines, 'Level', data.level === 0 ? 'Cantrip' : data.level);
	addLine(lines, 'School', data.school);
	addLine(lines, 'Casting Time', data.castingTime);
	addLine(lines, 'Range', data.range);
	addLine(lines, 'Duration', data.duration);
	addLine(lines, 'Components', data.components);
	addLine(lines, 'Ritual', data.ritual === true ? 'Yes' : data.ritual === false ? 'No' : '');
	addLine(lines, 'Concentration', data.concentration === true ? 'Yes' : data.concentration === false ? 'No' : '');
	return {
		title: text(data.name, 'Unnamed Spell'),
		subtitle: `${data.level === 0 ? 'Cantrip' : `Level ${displayText(data.level)}`} ${text(data.school)}`.trim(),
		lines,
		description: [text(data.description), text(data.higherLevel)].filter(Boolean).join('\n\n'),
		sections: effectsSection(data)
	};
}

function mapNpcStory(data: Record<string, unknown>): Open5eDetailViewModel {
	const lines: Open5eDetailViewModel['lines'] = [];
	addLine(lines, 'Personality', data.personality);
	addLine(lines, 'Ideals', data.ideals);
	addLine(lines, 'Bonds', data.bonds);
	addLine(lines, 'Flaws', data.flaws);
	return {
		title: text(data.name, 'Unnamed NPC'),
		subtitle: 'NPC',
		lines,
		description: text(data.description),
		sections: effectsSection(data)
	};
}

function mapCreature(data: Record<string, unknown>): MappedCreatureStatblock {
	const scores = record(data.abilityScores ?? data.abilities);
	const effects = toBlocks(data.effects);
	const special = toBlocks(data.traits);
	return {
		name: text(data.name, 'Unnamed Creature'),
		subtitle: `${text(data.size, 'Medium')} ${text(data.type, 'humanoid')}, ${text(data.alignment, 'unaligned')}`,
		armorClass: text(data.armorClass ?? data.ac, '—'),
		hitPoints: [text(data.hitPoints), text(data.hitDice)].filter(Boolean).join(' ') || '—',
		speed: text(data.speed, '—'),
		abilities: {
			str: numberValue(scores.strength ?? scores.str),
			dex: numberValue(scores.dexterity ?? scores.dex),
			con: numberValue(scores.constitution ?? scores.con),
			int: numberValue(scores.intelligence ?? scores.int),
			wis: numberValue(scores.wisdom ?? scores.wis),
			cha: numberValue(scores.charisma ?? scores.cha)
		},
		propertyLines: ([
			['Saving Throws', data.savingThrows],
			['Skills', data.skills],
			['Senses', data.senses],
			['Languages', data.languages],
			['Challenge', data.challengeRating ?? data.challenge]
		] as Array<[string, unknown]>).flatMap(([name, value]) => {
			const normalized = text(value);
			return normalized ? [{ name, value: normalized }] : [];
		}),
		traits: [...special, ...effects],
		actions: toBlocks(data.actions),
		bonusActions: toBlocks(data.bonusActions),
		reactions: toBlocks(data.reactions),
		legendaryActions: toBlocks(data.legendaryActions),
		mythicActions: toBlocks(data.mythicActions),
		lairActions: toBlocks(data.lairActions),
		regionalEffects: toBlocks(data.regionalEffects)
	};
}

export function toGeneratedContentPreview(content: GeneratedContent): GeneratedContentPreview {
	if (content.contentType === 'monster' || content.contentType === 'npcStats') {
		return { kind: 'creature', creature: mapCreature(content.data) };
	}
	if (content.contentType === 'npcFull') {
		const stats = record(content.data.stats);
		return {
			kind: 'creature',
			creature: mapCreature({ ...stats, name: content.data.name ?? stats.name })
		};
	}
	if (content.contentType === 'npcStory') {
		return { kind: 'detail', detail: mapNpcStory(content.data) };
	}
	if (content.contentType === 'spell') {
		return { kind: 'detail', detail: mapSpell(content.data) };
	}
	return {
		kind: 'detail',
		detail: mapItem(content.data, content.contentType)
	};
}
