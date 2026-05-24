import { useState } from 'react';
import SearchBar from '../components/common/SearchBar';
import AdvancedSearchFilters from '../components/search/AdvancedSearchFilters';
import usePageMeta from '../hooks/usePageMeta';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SearchSort, { type SearchCategoryKey } from '../components/search/SearchSort';
import './search-page.css';

function SearchPage() {
	const [selectedCategory, setSelectedCategory] = useState<SearchCategoryKey>('content');
	usePageMeta({
		title: 'Search',
		description:
			'Search RPG modules, campaigns, creatures, and items with category-specific filters and tags.',
		path: '/search'
	});

	return (
		<main className="page-main search-page">
			<h1>Search Page</h1>
			<SearchSort selectedCategory={selectedCategory} onChange={setSelectedCategory} />
			<AdvancedSearchFilters selectedCategory={selectedCategory} />
			<section className="search-panel" aria-labelledby="search-bar-heading">
				<h2 id="search-bar-heading">Search Bar</h2>
				<SearchBar
					label="Find content"
					placeholder="Search by name, tags, stat blocks, items, and more"
					helperText="Search will query indexed fields and Open5e-linked references."
				/>
			</section>
			<SearchFilters selectedCategory={selectedCategory} />
			<SearchResults selectedCategory={selectedCategory} />
		</main>
	);
}

export default SearchPage;

