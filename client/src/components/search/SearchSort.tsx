export type SearchCategoryKey = 'content' | 'creatureNpc' | 'allItems' | 'other';

type SearchSortProps = {
	selectedCategory: SearchCategoryKey;
	onChange: (category: SearchCategoryKey) => void;
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

function SearchSort({ selectedCategory, onChange }: SearchSortProps) {
	return (
		<section className="search-nav" aria-label="Search category navigation">
			{searchCategories.map((searchCategory) => (
				<button
					key={searchCategory.key}
					type="button"
					className={`search-nav__button ${
						selectedCategory === searchCategory.key ? 'search-nav__button--active' : ''
					}`}
					onClick={() => onChange(searchCategory.key)}
				>
					<strong>{searchCategory.heading}</strong>
					<p>{searchCategory.subCopy}</p>
				</button>
			))}
		</section>
	);
}

export default SearchSort;

