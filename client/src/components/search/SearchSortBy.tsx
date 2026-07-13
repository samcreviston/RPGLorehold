type SearchSortByProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
};

const sortOptions: ReadonlyArray<{ value: string; label: string }> = [
	{ value: 'relevance', label: 'Relevance' },
	{ value: 'publishedAt:desc', label: 'Newest published' },
	{ value: 'publishedAt:asc', label: 'Oldest published' },
	{ value: 'averageRating:desc', label: 'Highest rated' },
	{ value: 'averageRating:asc', label: 'Lowest rated' },
	{ value: 'favorites:desc', label: 'Most favorited' },
	{ value: 'favorites:asc', label: 'Least favorited' },
	{ value: 'views:desc', label: 'Most viewed' },
	{ value: 'views:asc', label: 'Least viewed' },
	{ value: 'title:asc', label: 'Title A–Z' },
	{ value: 'title:desc', label: 'Title Z–A' },
	{ value: 'startingLevel:asc', label: 'Starting level ↑' },
	{ value: 'startingLevel:desc', label: 'Starting level ↓' },
	{ value: 'endingLevel:asc', label: 'Ending level ↑' },
	{ value: 'endingLevel:desc', label: 'Ending level ↓' },
	{ value: 'numberOfAdventures:asc', label: 'Fewest adventures' },
	{ value: 'numberOfAdventures:desc', label: 'Most adventures' }
];

function SearchSortBy({ value, onChange, disabled = false }: SearchSortByProps) {
	return (
		<section className="search-labeled-row" aria-label="Sort by">
			<p className="search-labeled-row__label">Sort by</p>
			<div className="search-control-bar" role="group" aria-label="Search sort">
				<label className="search-control search-control--quarter">
					<span className="visually-hidden">Sort order</span>
					<select
						value={value}
						disabled={disabled}
						onChange={(event) => onChange(event.target.value)}
					>
						{sortOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>
			</div>
		</section>
	);
}

export default SearchSortBy;
