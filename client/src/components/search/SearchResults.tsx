import type { ContentSearchCategory, ContentSearchHit, ModuleSearchHit } from '../../api/search';
import { formatModuleCardAttributes } from '../../utils/formatModuleCardAttributes';
import ContentCard from './ContentCard';
import ModuleCard from './ModuleCard';

type SearchResultsProps = {
	hits: ModuleSearchHit[];
	loading: boolean;
	error: string | null;
	emptyMessage: string;
	favoriteIds?: Set<string>;
	onSelectResult?: (moduleId: string) => void;
	onFavoriteToggle?: (moduleId: string) => void;
	onAddToCampaign?: (hit: ModuleSearchHit) => void;
	contentHits?: ContentSearchHit[];
	contentCategory: ContentSearchCategory | undefined;
	onSelectContent?: (hit: ContentSearchHit) => void;
};

function SearchResults({
	hits,
	loading,
	error,
	emptyMessage,
	favoriteIds,
	onSelectResult,
	onFavoriteToggle,
	onAddToCampaign,
	contentHits = [],
	contentCategory,
	onSelectContent
}: SearchResultsProps) {
	return (
		<section className="search-panel" aria-labelledby="search-results-heading">
			<h2 id="search-results-heading">Search Results</h2>
			{loading ? <p>Searching…</p> : null}
			{error ? <p role="alert">{error}</p> : null}
			{!loading && !error && hits.length === 0 && contentHits.length === 0 ? <p>{emptyMessage}</p> : null}
			<div className={`search-results-grid${contentCategory ? ` search-results-grid--${contentCategory}` : ''}`}>
				{contentHits.map((hit) => (
					<ContentCard key={hit.id} hit={hit} onSelect={() => onSelectContent?.(hit)} />
				))}
				{hits.map((hit) => (
					<ModuleCard
						key={hit.id}
						contentName={hit.title}
						attributes={formatModuleCardAttributes(hit)}
						flavorText={hit.flavorText}
						isFavorited={favoriteIds?.has(hit.id) ?? false}
						{...(onFavoriteToggle ? { onFavoriteToggle: () => onFavoriteToggle(hit.id) } : {})}
						{...(onAddToCampaign ? { onAddToCampaign: () => onAddToCampaign(hit) } : {})}
						{...(onSelectResult ? { onSelect: () => onSelectResult(hit.id) } : {})}
					/>
				))}
			</div>
		</section>
	);
}

export default SearchResults;
