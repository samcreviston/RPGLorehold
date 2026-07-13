import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchModules, type ModuleSearchHit } from '../api/search';
import SearchBar from '../components/common/SearchBar';
import SearchResults from '../components/search/SearchResults';
import SearchSort, { type SearchCategoryKey } from '../components/search/SearchSort';
import usePageMeta from '../hooks/usePageMeta';
import './search-page.css';

function SearchPage() {
	usePageMeta({
		title: 'Search',
		description: 'Search RPG modules, campaigns, creatures, and items.',
		path: '/search'
	});

	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') ?? '';
	const [category, setCategory] = useState<SearchCategoryKey>('content');
	const [query, setQuery] = useState(initialQuery);
	const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
	const [hits, setHits] = useState<ModuleSearchHit[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalHits, setTotalHits] = useState(0);

	useEffect(() => {
		setQuery(searchParams.get('q') ?? '');
		setSubmittedQuery(searchParams.get('q') ?? '');
	}, [searchParams]);

	useEffect(() => {
		if (category !== 'content') {
			setHits([]);
			setTotalHits(0);
			setError(null);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		void searchModules({ q: submittedQuery, limit: 20 })
			.then((result) => {
				if (cancelled) {
					return;
				}
				setHits(result.hits);
				setTotalHits(result.estimatedTotalHits);
			})
			.catch((err: unknown) => {
				if (cancelled) {
					return;
				}
				setHits([]);
				setTotalHits(0);
				setError(err instanceof Error ? err.message : 'Search failed');
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [category, submittedQuery]);

	function runSearch() {
		const next = query.trim();
		setSubmittedQuery(next);
		if (next) {
			setSearchParams({ q: next });
		} else {
			setSearchParams({});
		}
	}

	const emptyMessage =
		category !== 'content'
			? 'This category is in progress — only Content (modules) is searchable today.'
			: submittedQuery
				? 'No published modules matched your search.'
				: totalHits === 0
					? 'No published modules are indexed yet.'
					: 'No published modules matched your search.';

	return (
		<main className="page-main search-page">
			<h1>Search</h1>
			<SearchBar
				label="Find content"
				placeholder="Search by name, tags, locations, and more"
				value={query}
				onChange={setQuery}
				onSubmit={runSearch}
			/>
			<SearchSort selectedCategory={category} onChange={setCategory} />
			<SearchResults
				hits={category === 'content' ? hits : []}
				loading={category === 'content' ? loading : false}
				error={category === 'content' ? error : null}
				emptyMessage={emptyMessage}
			/>
		</main>
	);
}

export default SearchPage;
