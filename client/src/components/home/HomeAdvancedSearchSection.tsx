import { Link } from 'react-router-dom';

type DotGroupKey = 'content' | 'creature' | 'items';

type HomeAdvancedSearchSectionProps = {
	selectedDotIndex: number;
};

const contentTypes = [
	{ label: 'Adventure', group: 'content', positionClassName: 'home-type-pill--adventure' },
	{ label: 'Module', group: 'content', positionClassName: 'home-type-pill--module' },
	{ label: 'Campaign', group: 'content', positionClassName: 'home-type-pill--campaign' },
	{ label: 'Monster', group: 'creature', positionClassName: 'home-type-pill--monster' },
	{ label: 'NPC', group: 'creature', positionClassName: 'home-type-pill--npc' },
	{ label: 'Premade Character', group: 'creature', positionClassName: 'home-type-pill--premade' },
	{ label: 'Magic Item', group: 'items', positionClassName: 'home-type-pill--magic-item' },
	{ label: 'Weapons', group: 'items', positionClassName: 'home-type-pill--weapons' },
	{ label: 'Gear', group: 'items', positionClassName: 'home-type-pill--gear' },
	{ label: 'Dungeon Items', group: 'items', positionClassName: 'home-type-pill--dungeon-items' }
] as const satisfies ReadonlyArray<{
	label: string;
	group: DotGroupKey;
	positionClassName: string;
}>;

const filterCopyByGroup: Record<DotGroupKey, string[]> = {
	content: [
		'Party level @start',
		'Party level @end',
		'Playstyle: More Roleplay, balanced, More Combat'
	],
	creature: ['Level/Challenge Rating (CR)', 'Race', 'Class', 'Biome'],
	items: ['Tier (Major)', 'Rarity (Rare)', 'Worth', 'Alignment']
};

function HomeAdvancedSearchSection({ selectedDotIndex }: HomeAdvancedSearchSectionProps) {
	const selectedGroup = (['content', 'creature', 'items'] as const)[selectedDotIndex] ?? 'content';

	return (
		<section id="advanced-search" className="home-section" aria-labelledby="advanced-search-heading">
			<h2 id="advanced-search-heading">Advanced Search</h2>
			<div className="home-two-column-grid">
				<div className="home-types-panel">
					<h3>Content Types</h3>
					<div className="home-types-grid" role="list" aria-label="Searchable content types">
						{contentTypes.map((contentType) => {
							const colorClassName =
								contentType.group === 'content'
									? 'home-type-pill--tan'
									: contentType.group === 'creature'
										? 'home-type-pill--white'
										: 'home-type-pill--blue';

							return (
								<p
									key={contentType.label}
									className={`home-type-pill ${colorClassName} ${contentType.positionClassName}`}
									role="listitem"
								>
									{contentType.label}
								</p>
							);
						})}
					</div>
					<div className="home-dot-indicator" aria-hidden="true">
						<span className={selectedDotIndex === 0 ? 'home-dot home-dot--active' : 'home-dot'} />
						<span className={selectedDotIndex === 1 ? 'home-dot home-dot--active' : 'home-dot'} />
						<span className={selectedDotIndex === 2 ? 'home-dot home-dot--active' : 'home-dot'} />
					</div>
				</div>
				<div className="home-filters-panel">
					<h3>Tags and Filters</h3>
					<ul>
						{filterCopyByGroup[selectedGroup].map((filterLabel) => (
							<li key={filterLabel}>{filterLabel}</li>
						))}
					</ul>
					<Link to="/search" className="home-section__button">
						Begin Searching Content
					</Link>
				</div>
			</div>
		</section>
	);
}

export default HomeAdvancedSearchSection;

