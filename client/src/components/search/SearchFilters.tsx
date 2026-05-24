import type { SearchCategoryKey } from './SearchSort';

type SearchFiltersProps = {
	selectedCategory: SearchCategoryKey;
};

const contentRows = [
	'Types: Module, Campaign, One-shot, Any Adventure',
	'Party level: 1-20 (or start/end levels for longer content)',
	'Playstyle: More Roleplay, Balanced, More Combat',
	'Alignment: LG, NG, CG, LN, N, CN, LE, NE, CE',
	'Biome(s): large selectable biome list',
	'Monster Included: search + multi-select Open5e monster matches',
	'Primary Enemy: race/creature type selector'
];

const creatureRows = [
	'Types: Monster, NPC, Pre-made Character',
	'Level/Challenge Rating (CR): 1-20',
	'Race: broad 5e race list',
	'Class: Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard, Custom',
	'Biome: large selectable biome list'
];

const itemRows = [
	'Types: Weapons, Armor, Gear, Potions, Magic Items, Beverage/Food, Dungeon/Environment Items',
	'Tier (Major): non-magic, minor, major, wondrous',
	'Rarity (Rare): Common, Uncommon, Rare, Very Rare, Legendary, Artifact',
	'Worth (GP): min and max integer range from -10 to 1,000,000,000',
	'Alignment: Lawful, Neutral, Chaotic, Good, Evil',
	'Cursed (checkbox)',
	'Sentient (checkbox)'
];

const otherRows = ['In-progress filters for Classes, Spells, and Races'];

const rowsByCategory: Record<SearchCategoryKey, string[]> = {
	content: contentRows,
	creatureNpc: creatureRows,
	allItems: itemRows,
	other: otherRows
};

function SearchFilters({ selectedCategory }: SearchFiltersProps) {
	return (
		<section className="search-panel" aria-labelledby="search-filters-heading">
			<h2 id="search-filters-heading">Search Filters</h2>
			<ul className="search-filter-list">
				{rowsByCategory[selectedCategory].map((row) => (
					<li key={row}>{row}</li>
				))}
			</ul>
		</section>
	);
}

export default SearchFilters;

