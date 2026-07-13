import type { ModuleSearchHit } from '../../api/search';
import ModuleCard from './ModuleCard';

type SearchResultsProps = {
	hits: ModuleSearchHit[];
	loading: boolean;
	error: string | null;
	emptyMessage: string;
	onSelectResult?: (moduleId: string) => void;
};

function formatAttributes(hit: ModuleSearchHit): string {
	const parts = [
		`Levels ${hit.startingLevel}–${hit.endingLevel}`,
		hit.playstyle,
		hit.biomes.slice(0, 2).join(', '),
		hit.authorUsername ? `by ${hit.authorUsername}` : ''
	].filter(Boolean);
	return parts.join(' · ');
}

function SearchResults({ hits, loading, error, emptyMessage, onSelectResult }: SearchResultsProps) {
	return (
		<section className="search-panel" aria-labelledby="search-results-heading">
			<h2 id="search-results-heading">Search Results</h2>
			{loading ? <p>Searching…</p> : null}
			{error ? <p role="alert">{error}</p> : null}
			{!loading && !error && hits.length === 0 ? <p>{emptyMessage}</p> : null}
			<div className="search-results-grid">
				{hits.map((hit) => (
					<ModuleCard
						key={hit.id}
						contentName={hit.title}
						attributes={formatAttributes(hit)}
						flavorText={hit.flavorText}
						{...(onSelectResult ? { onSelect: () => onSelectResult(hit.id) } : {})}
					/>
				))}
			</div>
		</section>
	);
}

export default SearchResults;
