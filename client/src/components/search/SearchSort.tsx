export type SearchCategoryKey = 'content' | 'creatureNpc' | 'allItems' | 'other';

type SearchSortProps = {
	selectedCategory: SearchCategoryKey;
	onChange: (category: SearchCategoryKey) => void;
	selectedTypes?: string[];
	onTypesChange?: (types: string[]) => void;
};

const searchCategories: ReadonlyArray<{ key: SearchCategoryKey; heading: string; subCopy: string }> = [
	{ key: 'content', heading: 'Content', subCopy: 'Module, campaign, adventure, world' },
	{
		key: 'creatureNpc',
		heading: 'Creature/NPC',
		subCopy: 'Monsters, NPCs, and pre-made characters'
	},
	{ key: 'allItems', heading: 'All Items', subCopy: 'Equipment, armor, tools, magical, and more' },
	{ key: 'other', heading: 'Other - In Progress', subCopy: 'Classes, spells, races' }
];

const typesByCategory: Partial<Record<SearchCategoryKey, Array<{ key: string; label: string }>>> = {
	creatureNpc: [
		{ key: 'monster', label: 'Monsters' },
		{ key: 'npc', label: 'NPCs' },
		{ key: 'premadeCharacter', label: 'Pre-made Characters' }
	],
	allItems: [
		{ key: 'item', label: 'Items' },
		{ key: 'weapon', label: 'Weapons' },
		{ key: 'armor', label: 'Armor' },
		{ key: 'magicItem', label: 'Magic Items' },
		{ key: 'beverageFood', label: 'Beverage/Food' }
	],
	other: [
		{ key: 'spell', label: 'Spells' },
		{ key: 'class', label: 'Classes' },
		{ key: 'condition', label: 'Conditions' },
		{ key: 'spellSchool', label: 'Spell Schools' },
		{ key: 'service', label: 'Services' }
	]
};

export function expandedContentTypes(category: SearchCategoryKey, selected: string[]): string[] {
	if (category !== 'creatureNpc') return selected;
	return selected.flatMap((type) => (type === 'npc' ? ['npc', 'npcStats'] : [type]));
}

function SearchSort({ selectedCategory, onChange, selectedTypes = [], onTypesChange }: SearchSortProps) {
	const types = typesByCategory[selectedCategory] ?? [];

	function toggleType(type: string) {
		onTypesChange?.(
			selectedTypes.includes(type)
				? selectedTypes.filter((selected) => selected !== type)
				: [...selectedTypes, type]
		);
	}

	function toggleAllTypes() {
		onTypesChange?.(selectedTypes.length === types.length ? [] : types.map((type) => type.key));
	}

	return (
		<section className="search-labeled-row" aria-label="Content type">
			<p className="search-labeled-row__label">Content Type</p>
			<div>
				<div className="search-nav" role="group" aria-label="Search category navigation">
					{searchCategories.map((searchCategory) => (
						<button
							key={searchCategory.key}
							type="button"
							className={`search-nav__button ${
								selectedCategory === searchCategory.key ? ' search-nav__button--active' : ''
							}`}
							onClick={() => onChange(searchCategory.key)}
						>
							<strong>{searchCategory.heading}</strong>
							<p>{searchCategory.subCopy}</p>
						</button>
					))}
				</div>
				{types.length > 0 ? (
					<div className="search-type-options" role="group" aria-label="Content types">
						<label>
							<input
								type="checkbox"
								checked={selectedTypes.length === types.length}
								onChange={toggleAllTypes}
							/>
							<span>All</span>
						</label>
						{types.map((type) => (
							<label key={type.key}>
								<input
									type="checkbox"
									checked={selectedTypes.includes(type.key)}
									onChange={() => toggleType(type.key)}
								/>
								<span>{type.label}</span>
							</label>
						))}
					</div>
				) : null}
			</div>
		</section>
	);
}

export default SearchSort;
