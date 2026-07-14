import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	addFavorite,
	listFavoriteModules,
	removeFavorite,
	type FavoriteModuleItem
} from '../api/favorites';
import ModuleCard from '../components/search/ModuleCard';
import usePageMeta from '../hooks/usePageMeta';
import { formatModuleCardAttributes } from '../utils/formatModuleCardAttributes';
import './dm-home-page.css';

function DmHomePage() {
	const navigate = useNavigate();
	const [favorites, setFavorites] = useState<FavoriteModuleItem[]>([]);
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	usePageMeta({
		title: 'DM Home',
		description: 'View saved content and campaigns built from your modules.',
		path: '/dm-home'
	});

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setIsLoading(true);
			setError('');
			try {
				const items = await listFavoriteModules();
				if (!cancelled) {
					setFavorites(items);
					setFavoriteIds(new Set(items.map((item) => String(item.module._id))));
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load saved content.');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, []);

	function openSavedModule(moduleId: string) {
		navigate(`/search?view=${encodeURIComponent(moduleId)}`);
	}

	async function handleFavoriteToggle(moduleId: string) {
		const currentlyFavorited = favoriteIds.has(moduleId);
		const previousFavorites = favorites;
		const previousIds = favoriteIds;

		setFavoriteIds((prev) => {
			const next = new Set(prev);
			if (currentlyFavorited) {
				next.delete(moduleId);
			} else {
				next.add(moduleId);
			}
			return next;
		});

		if (currentlyFavorited) {
			setFavorites((prev) => prev.filter((item) => String(item.module._id) !== moduleId));
		}

		try {
			if (currentlyFavorited) {
				await removeFavorite(moduleId);
			} else {
				await addFavorite(moduleId);
				const items = await listFavoriteModules();
				setFavorites(items);
				setFavoriteIds(new Set(items.map((item) => String(item.module._id))));
			}
		} catch {
			setFavorites(previousFavorites);
			setFavoriteIds(previousIds);
		}
	}

	return (
		<main className="page-main dm-home-page">
			<h1>DM Home</h1>
			<p className="dm-home-lede">
				Your saved content and campaigns will live here. Campaign lists of modules are coming next.
			</p>

			<section className="dm-home-section" aria-label="My campaigns">
				<h2>My campaigns</h2>
				<p className="dm-home-empty">No campaigns yet. Campaign creation is coming soon.</p>
				<button type="button" className="dm-home-secondary-button" onClick={() => navigate('/creator/home')}>
					Go to Creator Home
				</button>
			</section>

			<section className="dm-home-section" aria-label="Saved content">
				<h2>Saved content</h2>
				{isLoading ? <p>Loading saved content…</p> : null}
				{error ? <p className="dm-home-error" role="alert">{error}</p> : null}
				{!isLoading && !error && favorites.length === 0 ? (
					<p className="dm-home-empty">No saved modules yet.</p>
				) : null}
				{favorites.length > 0 ? (
					<div className="search-results-grid dm-home-saved-grid">
						{favorites.map(({ module, authorUsername }) => {
							const moduleId = String(module._id);
							return (
								<ModuleCard
									key={moduleId}
									contentName={module.title}
									attributes={formatModuleCardAttributes({
										startingLevel: module.startingLevel,
										endingLevel: module.endingLevel,
										playstyle: module.playstyle,
										biomes: module.biomes,
										authorUsername
									})}
									flavorText={module.flavorText}
									isFavorited={favoriteIds.has(moduleId)}
									onFavoriteToggle={() => void handleFavoriteToggle(moduleId)}
									onSelect={() => openSavedModule(moduleId)}
								/>
							);
						})}
					</div>
				) : null}
			</section>
		</main>
	);
}

export default DmHomePage;
