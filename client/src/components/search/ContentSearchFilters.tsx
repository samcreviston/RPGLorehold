import { useEffect, useMemo } from 'react';
import type { ContentSearchCategory } from '../../api/search';
import { damageTypeOptions } from '../../lib/content/contentSchema';

export type ContentFilterValues = {
	authorUsername: string;
	size: string;
	creatureType: string;
	alignment: string;
	className: string;
	ancestry: string;
	rarity: string;
	itemCategory: string;
	damageType: string;
	range: string;
	armorClass: string;
	strengthRequired: string;
	spellSchool: string;
	casterType: string;
	subclassOf: string;
};

export const emptyContentFilters: ContentFilterValues = {
	authorUsername: '',
	size: '',
	creatureType: '',
	alignment: '',
	className: '',
	ancestry: '',
	rarity: '',
	itemCategory: '',
	damageType: '',
	range: '',
	armorClass: '',
	strengthRequired: '',
	spellSchool: '',
	casterType: '',
	subclassOf: ''
};

type ContentSearchFiltersProps = {
	category: ContentSearchCategory;
	selectedTypes: string[];
	values: ContentFilterValues;
	onChange: (values: ContentFilterValues) => void;
};

const fieldsByType: Record<string, Array<keyof ContentFilterValues>> = {
	monster: ['size', 'creatureType', 'alignment'],
	npc: [],
	npcStats: ['size', 'creatureType', 'alignment', 'className'],
	premadeCharacter: ['className', 'ancestry'],
	item: ['itemCategory'],
	weapon: ['damageType', 'range'],
	armor: ['itemCategory', 'armorClass', 'strengthRequired'],
	magicItem: ['itemCategory', 'rarity'],
	beverageFood: [],
	spell: ['spellSchool'],
	class: ['casterType', 'subclassOf'],
	condition: [],
	spellSchool: [],
	service: []
};

const labels: Record<keyof ContentFilterValues, string> = {
	authorUsername: 'Author',
	size: 'Size',
	creatureType: 'Creature type',
	alignment: 'Alignment',
	className: 'Class',
	ancestry: 'Ancestry',
	rarity: 'Rarity',
	itemCategory: 'Item category',
	damageType: 'Damage type',
	range: 'Range',
	armorClass: 'Armor class',
	strengthRequired: 'Strength required',
	spellSchool: 'Spell school',
	casterType: 'Caster type',
	subclassOf: 'Subclass of'
};

function ContentSearchFilters({ category, selectedTypes, values, onChange }: ContentSearchFiltersProps) {
	const activeFields = useMemo(() => {
		const types = selectedTypes.flatMap((type) => (type === 'npc' ? ['npc', 'npcStats'] : [type]));
		if (types.length === 0) return new Set<keyof ContentFilterValues>(['authorUsername']);
		const first = new Set<keyof ContentFilterValues>(fieldsByType[types[0]!] ?? []);
		for (const type of types.slice(1)) {
			const fields = new Set(fieldsByType[type] ?? []);
			for (const field of first) {
				if (!fields.has(field)) first.delete(field);
			}
		}
		first.add('authorUsername');
		return first;
	}, [selectedTypes]);

	useEffect(() => {
		const next = { ...values };
		let changed = false;
		for (const key of Object.keys(next) as Array<keyof ContentFilterValues>) {
			if (!activeFields.has(key) && next[key]) {
				next[key] = '';
				changed = true;
			}
		}
		if (changed) onChange(next);
	}, [activeFields, onChange, values]);

	return (
		<section className="search-labeled-row" aria-label="Filter by">
			<p className="search-labeled-row__label">Filter by</p>
			<div className="search-control-bar" role="group" aria-label={`${category} filters`}>
				{[...activeFields].map((field) => (
					<label className="search-control" key={field}>
						<span>{labels[field]}</span>
						{field === 'damageType' ? (
							<select
								value={values[field]}
								onChange={(event) => onChange({ ...values, [field]: event.target.value })}
							>
								<option value="">Any</option>
								{damageTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
							</select>
						) : field === 'armorClass' ? (
							<select
								value={values[field]}
								onChange={(event) => onChange({ ...values, [field]: event.target.value })}
							>
								<option value="">Any</option>
								{Array.from({ length: 11 }, (_, index) => String(index + 10)).map((option) => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						) : (
							<input
							type="text"
							placeholder="Any"
							value={values[field]}
							onChange={(event) => onChange({ ...values, [field]: event.target.value })}
							/>
						)}
					</label>
				))}
			</div>
		</section>
	);
}

export default ContentSearchFilters;
