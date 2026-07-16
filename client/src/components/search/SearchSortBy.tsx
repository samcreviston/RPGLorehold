import type { ContentSearchCategory } from '../../api/search';

type SearchSortByProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	category?: 'content' | ContentSearchCategory;
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

const contentSortOptions = [
	{ value: 'relevance', label: 'Relevance' },
	{ value: 'publishedAt:desc', label: 'Newest published' },
	{ value: 'publishedAt:asc', label: 'Oldest published' },
	{ value: 'title:asc', label: 'Title A–Z' },
	{ value: 'title:desc', label: 'Title Z–A' },
	{ value: 'level:asc', label: 'Level ↑' },
	{ value: 'level:desc', label: 'Level ↓' },
	{ value: 'challengeRating:asc', label: 'CR ↑' },
	{ value: 'challengeRating:desc', label: 'CR ↓' }
];

function SearchSortBy({ value, onChange, disabled = false, category = 'content' }: SearchSortByProps) {
	const options = category === 'content' ? sortOptions : contentSortOptions;
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
						{options.map((option) => (
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
