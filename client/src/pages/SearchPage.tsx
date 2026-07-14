import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addFavorite, listFavoriteModules, removeFavorite } from '../api/favorites';
import { getPublishedModule } from '../api/modules';
import { searchModules, type ModuleSearchHit, type SearchModulesParams } from '../api/search';
import { useAuth } from '../auth/AuthContext';
import SearchBar from '../components/common/SearchBar';
import CampaignModulePickerDialog, {
	type CampaignModuleSource
} from '../components/campaign/CampaignModulePickerDialog';
import CampaignAddedToast from '../components/campaign/CampaignAddedToast';
import ModulePreviewView from '../components/module/ModulePreviewView';
import SearchFilters, {
	emptySearchFilters,
	type SearchFilterValues
} from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SearchSort, { type SearchCategoryKey } from '../components/search/SearchSort';
import SearchSortBy from '../components/search/SearchSortBy';
import usePageMeta from '../hooks/usePageMeta';
import type { ModuleDocument } from '../types/module';
import { adventuresFromModuleDocument } from '../utils/modulePreviewModel';
import './search-page.css';

type SearchPageTab = 'search' | 'view';

function toSearchParams(filters: SearchFilterValues, sort: string, q: string): SearchModulesParams {
	const params: SearchModulesParams = { q, limit: 20, sort };

	if (filters.playstyle) {
		params.playstyle = [filters.playstyle];
	}
	if (filters.alignment) {
		params.alignments = [filters.alignment];
	}
	if (filters.biomes.length > 0) {
		params.biomes = filters.biomes;
	}
	if (filters.tag.trim()) {
		params.tags = [filters.tag.trim()];
	}
	if (filters.authorUsername.trim()) {
		params.authorUsername = filters.authorUsername.trim();
	}
	if (filters.levelMin) {
		params.levelMin = Number(filters.levelMin);
	}
	if (filters.levelMax) {
		params.levelMax = Number(filters.levelMax);
	}
	if (filters.adventuresMin) {
		params.adventuresMin = Number(filters.adventuresMin);
	}
	if (filters.adventuresMax) {
		params.adventuresMax = Number(filters.adventuresMax);
	}

	return params;
}

function SearchPage() {
	usePageMeta({
		title: 'Search',
		description: 'Search RPG modules, campaigns, creatures, and items.',
		path: '/search'
	});

	const navigate = useNavigate();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') ?? '';
	const viewModuleId = searchParams.get('view')?.trim() ?? '';

	const [pageTab, setPageTab] = useState<SearchPageTab>(viewModuleId ? 'view' : 'search');
	const [category, setCategory] = useState<SearchCategoryKey>('content');
	const [query, setQuery] = useState(initialQuery);
	const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
	const [filters, setFilters] = useState<SearchFilterValues>(emptySearchFilters);
	const [sort, setSort] = useState('relevance');
	const [hits, setHits] = useState<ModuleSearchHit[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalHits, setTotalHits] = useState(0);
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

	const [viewedModule, setViewedModule] = useState<ModuleDocument | null>(null);
	const [viewAuthorUsername, setViewAuthorUsername] = useState('');
	const [viewLoading, setViewLoading] = useState(false);
	const [viewError, setViewError] = useState<string | null>(null);
	const [campaignSource, setCampaignSource] = useState<CampaignModuleSource | null>(null);
	const [addedToCampaignName, setAddedToCampaignName] = useState('');

	useEffect(() => {
		setQuery(searchParams.get('q') ?? '');
		setSubmittedQuery(searchParams.get('q') ?? '');
	}, [searchParams]);

	useEffect(() => {
		if (viewModuleId) {
			setPageTab('view');
		}
	}, [viewModuleId]);

	useEffect(() => {
		if (authLoading) {
			return;
		}

		if (!isAuthenticated) {
			setFavoriteIds(new Set());
			return;
		}

		let cancelled = false;
		void listFavoriteModules()
			.then((items) => {
				if (!cancelled) {
					setFavoriteIds(new Set(items.map((item) => String(item.module._id))));
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFavoriteIds(new Set());
				}
			});

		return () => {
			cancelled = true;
		};
	}, [authLoading, isAuthenticated]);

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

		void searchModules(toSearchParams(filters, sort, submittedQuery))
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
	}, [category, submittedQuery, filters, sort]);

	useEffect(() => {
		if (!viewModuleId) {
			setViewedModule(null);
			setViewAuthorUsername('');
			setViewError(null);
			setViewLoading(false);
			return;
		}

		let cancelled = false;
		setViewLoading(true);
		setViewError(null);

		void getPublishedModule(viewModuleId)
			.then((result) => {
				if (cancelled) {
					return;
				}
				setViewedModule(result.module);
				setViewAuthorUsername(result.authorUsername);
			})
			.catch((err: unknown) => {
				if (cancelled) {
					return;
				}
				setViewedModule(null);
				setViewAuthorUsername('');
				setViewError(err instanceof Error ? err.message : 'Failed to load module');
			})
			.finally(() => {
				if (!cancelled) {
					setViewLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [viewModuleId]);

	function syncSearchParams(nextQuery: string, nextViewId: string) {
		const next = new URLSearchParams();
		if (nextQuery) {
			next.set('q', nextQuery);
		}
		if (nextViewId) {
			next.set('view', nextViewId);
		}
		setSearchParams(next);
	}

	function runSearch() {
		const next = query.trim();
		setSubmittedQuery(next);
		setPageTab('search');
		syncSearchParams(next, viewModuleId);
	}

	function openResult(moduleId: string) {
		setPageTab('view');
		syncSearchParams(submittedQuery.trim(), moduleId);
	}

	function selectPageTab(tab: SearchPageTab) {
		setPageTab(tab);
		if (tab === 'search') {
			syncSearchParams(submittedQuery.trim(), viewModuleId);
		} else if (viewModuleId) {
			syncSearchParams(submittedQuery.trim(), viewModuleId);
		}
	}

	async function handleFavoriteToggle(moduleId: string) {
		if (!isAuthenticated) {
			navigate('/account', { state: { from: '/search' } });
			return;
		}

		const currentlyFavorited = favoriteIds.has(moduleId);
		setFavoriteIds((prev) => {
			const next = new Set(prev);
			if (currentlyFavorited) {
				next.delete(moduleId);
			} else {
				next.add(moduleId);
			}
			return next;
		});

		try {
			if (currentlyFavorited) {
				await removeFavorite(moduleId);
			} else {
				await addFavorite(moduleId);
			}
		} catch {
			setFavoriteIds((prev) => {
				const next = new Set(prev);
				if (currentlyFavorited) {
					next.add(moduleId);
				} else {
					next.delete(moduleId);
				}
				return next;
			});
		}
	}

	function openCampaignPicker(hit: ModuleSearchHit) {
		if (!isAuthenticated) {
			navigate('/account', { state: { from: '/search' } });
			return;
		}
		setCampaignSource({
			id: hit.id,
			title: hit.title,
			startingLevel: hit.startingLevel,
			endingLevel: hit.endingLevel
		});
	}

	const controlsDisabled = category !== 'content';

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
			<div className="search-mode-tabs" role="tablist" aria-label="Search page view">
				<button
					type="button"
					role="tab"
					id="search-tab-search"
					aria-selected={pageTab === 'search'}
					aria-controls="search-tab-panel"
					className={`search-mode-tab${pageTab === 'search' ? ' search-mode-tab--active' : ''}`}
					onClick={() => selectPageTab('search')}
				>
					Search
				</button>
				<button
					type="button"
					role="tab"
					id="search-tab-view"
					aria-selected={pageTab === 'view'}
					aria-controls="search-tab-panel"
					className={`search-mode-tab${pageTab === 'view' ? ' search-mode-tab--active' : ''}`}
					onClick={() => selectPageTab('view')}
				>
					View
				</button>
			</div>

			<div id="search-tab-panel" role="tabpanel" aria-labelledby={`search-tab-${pageTab}`}>
				{pageTab === 'search' ? (
					<>
						<h1>Search</h1>
						<SearchBar
							label="Find content"
							placeholder="Search by name, tags, locations, and more"
							value={query}
							onChange={setQuery}
							onSubmit={runSearch}
						/>
						<SearchSort selectedCategory={category} onChange={setCategory} />
						<SearchFilters values={filters} onChange={setFilters} disabled={controlsDisabled} />
						<SearchSortBy value={sort} onChange={setSort} disabled={controlsDisabled} />
						<SearchResults
							hits={category === 'content' ? hits : []}
							loading={category === 'content' ? loading : false}
							error={category === 'content' ? error : null}
							emptyMessage={emptyMessage}
							favoriteIds={favoriteIds}
							onSelectResult={openResult}
							onFavoriteToggle={handleFavoriteToggle}
							onAddToCampaign={openCampaignPicker}
						/>
					</>
				) : (
					<section className="search-view-panel" aria-label="Module view">
						{!viewModuleId ? (
							<p className="search-view-empty">
								Select a search result to view the full module here.
							</p>
						) : viewLoading ? (
							<p>Loading module…</p>
						) : viewError ? (
							<p role="alert">{viewError}</p>
						) : viewedModule ? (
							<ModulePreviewView
								title={viewedModule.title}
								authorName={viewAuthorUsername.trim() || 'Unknown author'}
								adventures={adventuresFromModuleDocument(viewedModule)}
								emptyMessage="This published module has no content to display."
							/>
						) : (
							<p className="search-view-empty">Module not found.</p>
						)}
					</section>
				)}
			</div>
			<CampaignModulePickerDialog
				isOpen={campaignSource !== null}
				source={campaignSource}
				onClose={() => setCampaignSource(null)}
				onCampaignUpdated={(campaign) => {
					setCampaignSource(null);
					setAddedToCampaignName(campaign.title);
				}}
			/>
			{addedToCampaignName ? (
				<CampaignAddedToast
					campaignName={addedToCampaignName}
					onClose={() => setAddedToCampaignName('')}
				/>
			) : null}
		</main>
	);
}

export default SearchPage;
