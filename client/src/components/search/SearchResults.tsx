import ModuleCard from './ModuleCard';
import type { SearchCategoryKey } from './SearchSort';

type SearchResultsProps = {
	selectedCategory: SearchCategoryKey;
};

const starterResultsByCategory: Record<SearchCategoryKey, Array<{ name: string; attributes: string; flavor: string }>> =
	{
		content: [
			{
				name: 'Ashfall Keep Module',
				attributes: 'Type: Module | Level 3-6 | Playstyle: Balanced | Biome: Ruins',
				flavor: 'A crumbling mountain fortress full of unstable alliances and forgotten relics.'
			},
			{
				name: 'Briarfen Campaign',
				attributes: 'Type: Campaign | Level 1-10 | Playstyle: More Roleplay | Biome: Marsh',
				flavor: 'Politics, disappearances, and swamp-born legends collide in a layered campaign arc.'
			}
		],
		creatureNpc: [
			{
				name: 'Riftwood Warden',
				attributes: 'Type: NPC | Level: 7 | Race: Wood Elf | Class: Ranger | Biome: Forest',
				flavor: 'A relentless protector of border villages with a network of hidden scouts.'
			}
		],
		allItems: [
			{
				name: 'Lantern of Quiet Embers',
				attributes: 'Type: Magic Item | Tier: Major | Rarity: Rare | Worth: 1200 GP',
				flavor: 'A lantern that dampens noise in a short radius while burning cold orange flame.'
			}
		],
		other: [
			{
				name: 'Spell Archetypes Starter Entry',
				attributes: 'Type: In Progress | Category: Other',
				flavor: 'Future results for classes, spells, and races will appear here.'
			}
		]
	};

function SearchResults({ selectedCategory }: SearchResultsProps) {
	return (
		<section className="search-panel" aria-labelledby="search-results-heading">
			<h2 id="search-results-heading">Search Results</h2>
			<div className="search-results-grid">
				{starterResultsByCategory[selectedCategory].map((result) => (
					<ModuleCard
						key={result.name}
						contentName={result.name}
						attributes={result.attributes}
						flavorText={result.flavor}
					/>
				))}
			</div>
		</section>
	);
}

export default SearchResults;

