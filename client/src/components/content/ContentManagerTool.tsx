import { useEffect, useState } from 'react';
import type { MappedCreatureStatblock, Open5eCreature } from '../../lib/open5e/creatureTypes';
import { mapOpen5eCreatureToStatblock } from '../../lib/open5e/mapOpen5eCreatureToStatblock';
import { mapOpen5eItemToDetailView } from '../../lib/open5e/mapOpen5eItemToDetailView';
import type { Open5eDetailViewModel } from '../../lib/open5e/open5eDetailTypes';
import type { Open5eKeyedItem } from '../../lib/open5e/findByDocumentKey';
import CreatureStatBlock from './CreatureStatBlock';
import Open5eDetailCard from './Open5eDetailCard';

type SearchResult = {
	id: string;
	name: string;
	detailPath?: string;
	objectModel?: string;
	raw: Open5eKeyedItem;
};

const filters = [
	'all',
	'creatures',
	'items',
	'magic items',
	'weapons',
	'armor',
	'conditions',
	'spells',
	'classes',
	'environments'
] as const;

type ContentManagerToolProps = {
	helperText?: string;
};

export default function ContentManagerTool({
	helperText = 'Browse 5e reference content while you create.'
}: ContentManagerToolProps) {
	const [isOpen, setIsOpen] = useState(true);
	const [filter, setFilter] = useState<(typeof filters)[number]>('all');
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
	const [detail, setDetail] = useState<Open5eDetailViewModel | null>(null);
	const [creature, setCreature] = useState<MappedCreatureStatblock | null>(null);

	useEffect(() => {
		const search = query.trim();
		if (!search) {
			setResults([]);
			setStatus('idle');
			return;
		}

		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setStatus('loading');
			try {
				const endpoint =
					filter === 'all'
						? `search/?query=${encodeURIComponent(search)}`
						: `${filter === 'magic items' ? 'magicitems' : filter}/?name__icontains=${encodeURIComponent(search)}`;
				const response = await fetch(`/open5e-api/${endpoint}`, { signal: controller.signal });
				if (!response.ok) {
					throw new Error(`Search failed (${response.status})`);
				}
				const data = (await response.json()) as { results?: Open5eKeyedItem[] };
				setResults(
					(data.results ?? []).map((entry, index) => {
						const objectModel =
							typeof entry.object_model === 'string' ? entry.object_model : undefined;
						const route = typeof entry.route === 'string' ? entry.route.replace(/^v2\//, '') : '';
						const id = String(entry.slug ?? entry.key ?? entry.object_pk ?? index);
						return {
							id,
							name: String(entry.name ?? entry.object_name ?? 'Unknown'),
							raw: entry,
							...(objectModel ? { objectModel } : {}),
							...(route ? { detailPath: `${route.replace(/\/$/, '')}/${id}/` } : {})
						};
					})
				);
				setStatus('done');
			} catch (error) {
				if ((error as Error).name !== 'AbortError') {
					setStatus('error');
				}
			}
		}, 400);

		return () => {
			window.clearTimeout(timeoutId);
			controller.abort();
		};
	}, [filter, query]);

	const openResult = (result: SearchResult) => {
		const isCreature =
			filter === 'creatures' ||
			result.objectModel?.toLowerCase() === 'creature' ||
			result.detailPath?.includes('creatures') === true;
		setSelectedResult(result);
		setCreature(isCreature ? mapOpen5eCreatureToStatblock(result.raw as Open5eCreature) : null);
		setDetail(isCreature ? null : mapOpen5eItemToDetailView(result.raw, result.objectModel ?? filter));
		if (!result.detailPath) {
			return;
		}
		void fetch(`/open5e-api/${result.detailPath}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to load content (${response.status})`);
				}
				return response.json() as Promise<Open5eKeyedItem>;
			})
			.then((data) => {
				if (isCreature) {
					setCreature(mapOpen5eCreatureToStatblock(data as Open5eCreature));
					return;
				}
				setDetail(mapOpen5eItemToDetailView(data, result.objectModel ?? filter));
			})
			.catch(() => undefined);
	};

	return (
		<section
			className={`sidebar-tool-card content-manager-tool${isOpen ? '' : ' sidebar-tool-card--collapsed'}`}
			aria-label="5e Content Manager"
		>
			<div className="section-card-heading">
				<h4>5e Content Manager</h4>
				<button
					type="button"
					className="section-collapse-button"
					aria-expanded={isOpen}
					aria-label={isOpen ? 'Collapse 5e Content Manager' : 'Expand 5e Content Manager'}
					onClick={() => setIsOpen((previous) => !previous)}
				>
					{isOpen ? '▾' : '▸'}
				</button>
			</div>
			{isOpen ? (
				<>
					<p className="content-manager-helper">{helperText}</p>
					<div className="content-filter-row" aria-label="5e content filters">
						{filters.map((option) => (
							<button
								key={option}
								type="button"
								className={`content-filter-chip ${filter === option ? 'content-filter-chip--selected' : ''}`}
								onClick={() => setFilter(option)}
							>
								{option}
							</button>
						))}
					</div>
					<form className="content-search-form" onSubmit={(event) => event.preventDefault()}>
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search 5e content"
							aria-label="Search 5e content"
						/>
					</form>
					<section className="content-results-panel" aria-label="5e content results and detail">
						{selectedResult ? (
							<div className="content-detail-view">
								<button
									type="button"
									className="content-back-button"
									onClick={() => {
										setSelectedResult(null);
										setDetail(null);
										setCreature(null);
									}}
								>
									← Back to results
								</button>
								{creature ? (
									<CreatureStatBlock creature={creature} />
								) : detail ? (
									<Open5eDetailCard detail={detail} />
								) : (
									<h5>{selectedResult.name}</h5>
								)}
							</div>
						) : status === 'loading' ? (
							<p className="content-results-empty">Loading results…</p>
						) : results.length ? (
							<div className="content-results-list" role="list">
								{results.map((result) => (
									<button key={result.id} type="button" className="content-result-item" onClick={() => openResult(result)}>
										<strong>{result.name}</strong>
									</button>
								))}
							</div>
						) : (
							<p className="content-results-empty">
								{status === 'error' ? 'Unable to search content.' : 'Choose a filter and search to populate this panel.'}
							</p>
						)}
					</section>
				</>
			) : null}
		</section>
	);
}
