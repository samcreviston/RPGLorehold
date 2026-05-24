import type { SearchCategoryKey } from './SearchSort';

type AdvancedSearchFiltersProps = {
	selectedCategory: SearchCategoryKey;
};

const helperCopy: Record<SearchCategoryKey, string> = {
	content: 'Content search supports module, campaign, one-shot, adventure, and world labels.',
	creatureNpc:
		'Creature/NPC search supports monsters, NPCs, and pre-made characters with stat filters.',
	allItems: 'Item search supports equipment, armor, gear, potions, and magical item filtering.',
	other: 'In-progress category will host classes, spells, and race references.'
};

function AdvancedSearchFilters({ selectedCategory }: AdvancedSearchFiltersProps) {
	return (
		<section className="search-panel" aria-labelledby="search-bar-filters-heading">
			<h2 id="search-bar-filters-heading">Search Bar Filters</h2>
			<p>{helperCopy[selectedCategory]}</p>
		</section>
	);
}

export default AdvancedSearchFilters;

