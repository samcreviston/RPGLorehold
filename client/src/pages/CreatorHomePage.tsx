import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listModules } from '../api/modules';
import type { ModuleDocument } from '../types/module';
import usePageMeta from '../hooks/usePageMeta';
import { clearLastCreatorModuleId } from '../utils/lastCreatorModule';
import './creator-home-page.css';

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return 'Unknown date';
	}
	return date.toLocaleString();
}

function CreatorHomePage() {
	const navigate = useNavigate();
	const [drafts, setDrafts] = useState<ModuleDocument[]>([]);
	const [published, setPublished] = useState<ModuleDocument[]>([]);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	usePageMeta({
		title: 'Creator Home',
		description: 'Review your in-progress and published RPG content before opening the creator workflow.',
		path: '/creator/home'
	});

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setIsLoading(true);
			setError('');
			try {
				const [draftModules, publishedModules] = await Promise.all([
					listModules('draft'),
					listModules('published')
				]);
				if (!cancelled) {
					setDrafts(draftModules);
					setPublished(publishedModules);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load modules.');
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

	const openModule = (moduleId: string) => {
		navigate(`/creator?moduleId=${encodeURIComponent(String(moduleId))}`);
	};

	return (
		<main className="page-main creator-home-page">
			<h1>Creator Home</h1>
			<p>Your in-progress and published modules.</p>

			<button
				type="button"
				className="primary-action"
				onClick={() => {
					clearLastCreatorModuleId();
					navigate('/creator');
				}}
			>
				Create Content
			</button>

			{isLoading ? <p>Loading your content…</p> : null}
			{error ? <p className="creator-home-error">{error}</p> : null}

			<section className="creator-home-section" aria-label="In progress modules">
				<h2>In progress</h2>
				{!isLoading && drafts.length === 0 ? (
					<p className="page-note">No draft modules yet.</p>
				) : (
					<ul className="creator-home-list">
						{drafts.map((module) => (
							<li key={module._id}>
								<button
									type="button"
									className="creator-home-item"
									onClick={() => openModule(module._id)}
								>
									<span className="creator-home-item__title">{module.title}</span>
									<span className="creator-home-item__meta">
										Updated {formatDate(module.updatedAt)}
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="creator-home-section" aria-label="Published modules">
				<h2>Published</h2>
				{!isLoading && published.length === 0 ? (
					<p className="page-note">No published modules yet.</p>
				) : (
					<ul className="creator-home-list">
						{published.map((module) => (
							<li key={module._id}>
								<button
									type="button"
									className="creator-home-item"
									onClick={() => openModule(module._id)}
								>
									<span className="creator-home-item__title">{module.title}</span>
									<span className="creator-home-item__meta">
										Updated {formatDate(module.updatedAt)}
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}

export default CreatorHomePage;
