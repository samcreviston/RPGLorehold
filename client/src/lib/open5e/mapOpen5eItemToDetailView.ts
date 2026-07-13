import {
	getDocumentDisplayName,
	getOpen5eResultDescription,
	type Open5eKeyedItem
} from './findByDocumentKey';
import type { Open5eDetailLine, Open5eDetailSection, Open5eDetailViewModel } from './open5eDetailTypes';

function pushLine(lines: Open5eDetailLine[], label: string, value: unknown) {
	if (value == null || value === '') {
		return;
	}
	const text = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
		? String(value)
		: null;
	if (!text || text === 'null' || text === 'undefined') {
		return;
	}
	lines.push({ label, value: text });
}

function namedKey(value: unknown): string {
	if (!value || typeof value !== 'object') {
		return '';
	}
	const record = value as { name?: string; key?: string };
	return record.name ?? record.key ?? '';
}

function mapDescriptions(item: Open5eKeyedItem): string {
	return getOpen5eResultDescription(item);
}

function mapItemLike(item: Open5eKeyedItem, subtitleFallback: string): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Category', namedKey(item.category));
	pushLine(lines, 'Rarity', namedKey(item.rarity));
	pushLine(lines, 'Size', namedKey(item.size));
	if (item.weight != null && item.weight !== '') {
		pushLine(lines, 'Weight', `${item.weight}${item.weight_unit ? ` ${item.weight_unit}` : ''}`);
	}
	pushLine(lines, 'Cost', item.cost);
	if (item.requires_attunement === true) {
		pushLine(lines, 'Attunement', item.attunement_detail ? String(item.attunement_detail) : 'Required');
	} else if (item.requires_attunement === false) {
		pushLine(lines, 'Attunement', 'No');
	}
	pushLine(lines, 'Source', getDocumentDisplayName(item));

	const categoryName = namedKey(item.category);
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: categoryName || subtitleFallback,
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

function mapWeapon(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Damage', item.damage_dice);
	pushLine(lines, 'Damage Type', namedKey(item.damage_type));
	if (item.range || item.long_range) {
		const unit = typeof item.distance_unit === 'string' ? item.distance_unit : 'feet';
		pushLine(lines, 'Range', `${item.range ?? 0}/${item.long_range ?? 0} ${unit}`);
	}
	pushLine(lines, 'Simple', item.is_simple === true ? 'Yes' : item.is_simple === false ? 'No' : '');
	pushLine(lines, 'Improvised', item.is_improvised === true ? 'Yes' : item.is_improvised === false ? 'No' : '');
	pushLine(lines, 'Source', getDocumentDisplayName(item));

	const properties = Array.isArray(item.properties) ? item.properties : [];
	const sections: Open5eDetailSection[] = [];
	const blocks = properties
		.map((entry) => {
			if (!entry || typeof entry !== 'object') {
				return null;
			}
			const record = entry as {
				property?: { name?: string; desc?: string; type?: string | null };
				detail?: string | null;
			};
			const name = record.property?.name ?? 'Property';
			const detail = record.detail ? ` (${record.detail})` : '';
			const type = record.property?.type ? ` [${record.property.type}]` : '';
			const desc = `${record.property?.desc ?? ''}${detail}`.trim();
			return { name: `${name}${type}`, desc };
		})
		.filter((block): block is { name: string; desc: string } => Boolean(block && block.desc));

	if (blocks.length > 0) {
		sections.push({ title: 'Properties', blocks });
	}

	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Weapon',
		lines,
		description: mapDescriptions(item),
		sections
	};
}

function mapArmor(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Armor Class', item.ac_display ?? item.ac_base);
	pushLine(lines, 'Category', item.category);
	pushLine(lines, 'Stealth Disadvantage', item.grants_stealth_disadvantage === true ? 'Yes' : item.grants_stealth_disadvantage === false ? 'No' : '');
	pushLine(lines, 'Strength Required', item.strength_score_required);
	pushLine(lines, 'Source', getDocumentDisplayName(item));
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Armor',
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

function mapSpell(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	const level = item.level;
	pushLine(lines, 'Level', level === 0 ? 'Cantrip' : level);
	pushLine(lines, 'School', namedKey(item.school));
	pushLine(lines, 'Casting Time', item.casting_time);
	pushLine(lines, 'Range', item.range_text ?? item.range);
	pushLine(lines, 'Duration', item.duration);
	const components = [
		item.verbal ? 'V' : '',
		item.somatic ? 'S' : '',
		item.material ? `M${item.material_specified ? ` (${item.material_specified})` : ''}` : ''
	]
		.filter(Boolean)
		.join(', ');
	pushLine(lines, 'Components', components);
	pushLine(lines, 'Ritual', item.ritual === true ? 'Yes' : item.ritual === false ? 'No' : '');
	pushLine(lines, 'Concentration', item.concentration === true ? 'Yes' : item.concentration === false ? 'No' : '');
	pushLine(lines, 'Target', item.target_type);
	pushLine(lines, 'Source', getDocumentDisplayName(item));

	const descriptionParts = [mapDescriptions(item), typeof item.higher_level === 'string' ? item.higher_level : '']
		.filter(Boolean)
		.join('\n\n');

	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: level === 0 ? `${namedKey(item.school)} Cantrip` : `Level ${level} ${namedKey(item.school)}`.trim(),
		lines,
		description: descriptionParts,
		sections: []
	};
}

function mapCondition(item: Open5eKeyedItem): Open5eDetailViewModel {
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Condition',
		lines: [{ label: 'Source', value: getDocumentDisplayName(item) }].filter((line) => line.value),
		description: mapDescriptions(item),
		sections: []
	};
}

function mapSpellSchool(item: Open5eKeyedItem): Open5eDetailViewModel {
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Spell School',
		lines: [{ label: 'Source', value: getDocumentDisplayName(item) }].filter((line) => line.value),
		description: mapDescriptions(item),
		sections: []
	};
}

function mapClass(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Hit Dice', item.hit_dice);
	pushLine(lines, 'Caster Type', item.caster_type);
	pushLine(lines, 'Subclass Of', namedKey(item.subclass_of));
	pushLine(lines, 'Source', getDocumentDisplayName(item));

	const features = Array.isArray(item.features) ? item.features : [];
	const blocks = features
		.slice(0, 12)
		.map((feature) => {
			if (!feature || typeof feature !== 'object') {
				return null;
			}
			const record = feature as { name?: string; desc?: string };
			return {
				name: record.name ?? 'Feature',
				desc: record.desc ?? ''
			};
		})
		.filter((block): block is { name: string; desc: string } => Boolean(block));

	const sections: Open5eDetailSection[] = blocks.length > 0 ? [{ title: 'Features', blocks }] : [];

	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: namedKey(item.subclass_of) ? `Subclass of ${namedKey(item.subclass_of)}` : 'Class',
		lines,
		description: mapDescriptions(item),
		sections
	};
}

function mapEnvironment(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Aquatic', item.aquatic === true ? 'Yes' : item.aquatic === false ? 'No' : '');
	pushLine(lines, 'Planar', item.planar === true ? 'Yes' : item.planar === false ? 'No' : '');
	pushLine(lines, 'Interior', item.interior === true ? 'Yes' : item.interior === false ? 'No' : '');
	pushLine(lines, 'Source', getDocumentDisplayName(item));
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Environment',
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

function mapAbility(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Short', item.short_desc);
	pushLine(lines, 'Source', getDocumentDisplayName(item));

	const skills = Array.isArray(item.skills) ? item.skills : [];
	const skillNames = skills
		.map((skill) => (skill && typeof skill === 'object' ? (skill as { name?: string }).name : ''))
		.filter(Boolean)
		.join(', ');
	pushLine(lines, 'Skills', skillNames);

	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Ability Score',
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

function mapSkill(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Ability', item.ability);
	pushLine(lines, 'Source', getDocumentDisplayName(item));
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Skill',
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

function mapService(item: Open5eKeyedItem): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Cost', item.cost);
	pushLine(lines, 'Detail', item.detail);
	pushLine(lines, 'Source', getDocumentDisplayName(item));
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: 'Service',
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

function mapFallback(item: Open5eKeyedItem, kind: string): Open5eDetailViewModel {
	const lines: Open5eDetailLine[] = [];
	pushLine(lines, 'Source', getDocumentDisplayName(item));
	return {
		title: String(item.name ?? 'Unknown'),
		subtitle: kind,
		lines,
		description: mapDescriptions(item),
		sections: []
	};
}

export type Open5eDetailKind =
	| 'items'
	| 'magicitems'
	| 'weapons'
	| 'armor'
	| 'conditions'
	| 'spells'
	| 'spellschools'
	| 'classes'
	| 'environments'
	| 'abilities'
	| 'skills'
	| 'services'
	| 'unknown';

export function inferOpen5eDetailKind(
	filterOrModel: string | undefined,
	item?: Open5eKeyedItem
): Open5eDetailKind {
	const normalized = (filterOrModel ?? '').toLowerCase().replace(/\s+/g, '');
	if (normalized.includes('magicitem') || normalized === 'magicitems') {
		return 'magicitems';
	}
	if (normalized.includes('item')) {
		return 'items';
	}
	if (normalized.includes('weapon')) {
		return 'weapons';
	}
	if (normalized.includes('armor')) {
		return 'armor';
	}
	if (normalized.includes('condition')) {
		return 'conditions';
	}
	if (normalized.includes('spellschool')) {
		return 'spellschools';
	}
	if (normalized.includes('spell')) {
		return 'spells';
	}
	if (normalized.includes('class')) {
		return 'classes';
	}
	if (normalized.includes('environment')) {
		return 'environments';
	}
	if (normalized.includes('abilit')) {
		return 'abilities';
	}
	if (normalized.includes('skill')) {
		return 'skills';
	}
	if (normalized.includes('service')) {
		return 'services';
	}

	if (item?.damage_dice || item?.properties) {
		return 'weapons';
	}
	if (item?.ac_display != null || item?.ac_base != null) {
		return 'armor';
	}
	if (item?.casting_time || item?.school) {
		return 'spells';
	}
	if (item?.rarity) {
		return 'magicitems';
	}
	if (item?.features) {
		return 'classes';
	}
	if (item?.short_desc && item?.skills) {
		return 'abilities';
	}
	if (item?.ability && item?.descriptions) {
		return 'skills';
	}
	if (item?.detail && item?.cost) {
		return 'services';
	}

	return 'unknown';
}

export function mapOpen5eItemToDetailView(
	item: Open5eKeyedItem,
	kindHint?: string
): Open5eDetailViewModel {
	const kind = inferOpen5eDetailKind(kindHint, item);
	switch (kind) {
		case 'items':
			return mapItemLike(item, 'Item');
		case 'magicitems':
			return mapItemLike(item, 'Magic Item');
		case 'weapons':
			return mapWeapon(item);
		case 'armor':
			return mapArmor(item);
		case 'conditions':
			return mapCondition(item);
		case 'spells':
			return mapSpell(item);
		case 'spellschools':
			return mapSpellSchool(item);
		case 'classes':
			return mapClass(item);
		case 'environments':
			return mapEnvironment(item);
		case 'abilities':
			return mapAbility(item);
		case 'skills':
			return mapSkill(item);
		case 'services':
			return mapService(item);
		default:
			return mapFallback(item, 'Open5e Content');
	}
}
