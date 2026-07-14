import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign, listCampaigns, updateCampaign } from '../api/campaigns';
import {
	addFavorite,
	listFavoriteModules,
	removeFavorite,
	type FavoriteModuleItem
} from '../api/favorites';
import ModuleCard from '../components/search/ModuleCard';
import CampaignCard from '../components/campaign/CampaignCard';
import CampaignEditor from '../components/campaign/CampaignEditor';
import CreateCampaignDialog from '../components/campaign/CreateCampaignDialog';
import CampaignModulePickerDialog, {
	type CampaignModuleSource
} from '../components/campaign/CampaignModulePickerDialog';
import InsertModuleDialog from '../components/campaign/InsertModuleDialog';
import CampaignAddedToast from '../components/campaign/CampaignAddedToast';
import SessionManagerPanel from '../components/campaign/SessionManagerPanel';
import usePageMeta from '../hooks/usePageMeta';
import type { Campaign } from '../types/campaign';
import { formatModuleCardAttributes } from '../utils/formatModuleCardAttributes';
import './dm-home-page.css';

type DmHomeTab = 'campaign-planner' | 'session-manager';

function DmHomePage() {
	const navigate = useNavigate();
	const [pageTab, setPageTab] = useState<DmHomeTab>('campaign-planner');
	const [favorites, setFavorites] = useState<FavoriteModuleItem[]>([]);
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
	const [sessionCampaignId, setSessionCampaignId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [campaignError, setCampaignError] = useState('');
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
	const [createCampaignError, setCreateCampaignError] = useState('');
	const [campaignSaveStatus, setCampaignSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
		'idle'
	);
	const [campaignSaveMessage, setCampaignSaveMessage] = useState(
		'Autosaves every 30 seconds.'
	);
	const [campaignPickerSource, setCampaignPickerSource] = useState<CampaignModuleSource | null>(null);
	const [insertIndex, setInsertIndex] = useState<number | null>(null);
	const [addedToCampaignName, setAddedToCampaignName] = useState('');
	const selectedCampaignRef = useRef<Campaign | null>(null);
	const campaignDirtyRef = useRef(false);
	const campaignSavingRef = useRef(false);
	const flushCampaignRef = useRef<(options?: { manual?: boolean }) => Promise<void>>(async () => {});

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
				const [items, campaignItems] = await Promise.all([listFavoriteModules(), listCampaigns()]);
				if (!cancelled) {
					setFavorites(items);
					setFavoriteIds(new Set(items.map((item) => String(item.module._id))));
					setCampaigns(campaignItems);
				}
			} catch (err) {
				if (!cancelled) {
					const message = err instanceof Error ? err.message : 'Failed to load DM content.';
					setError(message);
					setCampaignError(message);
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

	flushCampaignRef.current = async (options) => {
		const campaign = selectedCampaignRef.current;
		const manual = options?.manual === true;

		if (!campaign || campaignSavingRef.current) {
			return;
		}

		if (!campaignDirtyRef.current) {
			if (manual) {
				setCampaignSaveStatus('saved');
				setCampaignSaveMessage('All changes saved.');
			}
			return;
		}

		campaignSavingRef.current = true;
		setCampaignSaveStatus('saving');
		setCampaignSaveMessage(manual ? 'Saving campaign…' : 'Autosaving campaign…');
		setCampaignError('');
		try {
			const saved = await updateCampaign(campaign._id, {
				title: campaign.title,
				entries: campaign.entries.map(
					({ id, moduleId, plannedStartingLevel, plannedEndingLevel, dmNotes }) => ({
						id,
						moduleId,
						plannedStartingLevel,
						plannedEndingLevel,
						dmNotes
					})
				)
			});
			if (selectedCampaignRef.current?._id === saved._id) {
				selectedCampaignRef.current = saved;
				setSelectedCampaign(saved);
			}
			setCampaigns((previous) =>
				previous.map((item) => (item._id === saved._id ? saved : item))
			);
			campaignDirtyRef.current = false;
			setCampaignSaveStatus('saved');
			setCampaignSaveMessage(manual ? 'Campaign saved.' : 'Campaign autosaved.');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to save campaign changes.';
			setCampaignError(message);
			setCampaignSaveStatus('error');
			setCampaignSaveMessage(message);
		} finally {
			campaignSavingRef.current = false;
		}
	};

	useEffect(() => {
		const interval = window.setInterval(() => {
			void flushCampaignRef.current();
		}, 30_000);
		return () => {
			window.clearInterval(interval);
			void flushCampaignRef.current();
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

	async function selectCampaign(campaign: Campaign) {
		await flushCampaignRef.current();
		campaignDirtyRef.current = false;
		selectedCampaignRef.current = campaign;
		setSelectedCampaign(campaign);
		setCampaignSaveStatus('idle');
		setCampaignSaveMessage('Autosaves every 30 seconds.');
	}

	function handleCampaignChange(nextCampaign: Campaign) {
		campaignDirtyRef.current = true;
		selectedCampaignRef.current = nextCampaign;
		setSelectedCampaign(nextCampaign);
		setCampaigns((previous) =>
			previous.map((campaign) => (campaign._id === nextCampaign._id ? nextCampaign : campaign))
		);
		setCampaignSaveStatus('idle');
		setCampaignSaveMessage('Unsaved changes. Autosaves every 30 seconds.');
	}

	function handleCampaignUpdated(campaign: Campaign) {
		setCampaigns((previous) =>
			previous.some((item) => item._id === campaign._id)
				? previous.map((item) => (item._id === campaign._id ? campaign : item))
				: [campaign, ...previous]
		);
		if (selectedCampaignRef.current?._id === campaign._id) {
			selectedCampaignRef.current = campaign;
			setSelectedCampaign(campaign);
			campaignDirtyRef.current = false;
			setCampaignSaveStatus('saved');
			setCampaignSaveMessage('Campaign saved.');
		}
	}

	function handleManualCampaignSave() {
		void flushCampaignRef.current({ manual: true });
	}

	function insertModuleIntoSelectedCampaign(source: CampaignModuleSource) {
		const campaign = selectedCampaignRef.current;
		const index = insertIndex;
		if (!campaign || index === null) {
			return;
		}
		const entries = campaign.entries.slice();
		entries.splice(index, 0, {
			id: crypto.randomUUID(),
			moduleId: source.id,
			plannedStartingLevel: source.startingLevel,
			plannedEndingLevel: source.endingLevel,
			dmNotes: '',
			module: null,
			authorUsername: ''
		});
		handleCampaignChange({ ...campaign, entries });
		setInsertIndex(null);
		setAddedToCampaignName(campaign.title);
		void flushCampaignRef.current();
	}

	function removeModuleFromSelectedCampaign(entryId: string) {
		const campaign = selectedCampaignRef.current;
		if (!campaign) {
			return;
		}
		handleCampaignChange({
			...campaign,
			entries: campaign.entries.filter((entry) => entry.id !== entryId)
		});
		void flushCampaignRef.current();
	}

	async function handleCreateCampaign(title: string) {
		setIsCreatingCampaign(true);
		setCreateCampaignError('');
		try {
			const campaign = await createCampaign(title);
			setCampaigns((previous) => [campaign, ...previous]);
			selectedCampaignRef.current = campaign;
			setSelectedCampaign(campaign);
			campaignDirtyRef.current = false;
			setCampaignSaveStatus('idle');
			setCampaignSaveMessage('Autosaves every 30 seconds.');
			setIsCreateDialogOpen(false);
		} catch (err) {
			setCreateCampaignError(err instanceof Error ? err.message : 'Failed to create campaign.');
		} finally {
			setIsCreatingCampaign(false);
		}
	}

	const sessionCampaign =
		sessionCampaignId === null
			? null
			: (campaigns.find((campaign) => campaign._id === sessionCampaignId) ?? null);

	return (
		<main className="page-main dm-home-page">
			<div className="dm-home-tabs" role="tablist" aria-label="DM Home view">
				<button
					type="button"
					role="tab"
					id="dm-home-tab-campaign-planner"
					aria-selected={pageTab === 'campaign-planner'}
					aria-controls="dm-home-tab-panel"
					className={`dm-home-tab${pageTab === 'campaign-planner' ? ' dm-home-tab--active' : ''}`}
					onClick={() => setPageTab('campaign-planner')}
				>
					Campaign Planner
				</button>
				<button
					type="button"
					role="tab"
					id="dm-home-tab-session-manager"
					aria-selected={pageTab === 'session-manager'}
					aria-controls="dm-home-tab-panel"
					className={`dm-home-tab${pageTab === 'session-manager' ? ' dm-home-tab--active' : ''}`}
					onClick={() => setPageTab('session-manager')}
				>
					Session Manager
				</button>
			</div>

			<div id="dm-home-tab-panel" role="tabpanel" aria-labelledby={`dm-home-tab-${pageTab}`}>
				{pageTab === 'campaign-planner' ? (
					<>
						<h1>DM Home</h1>
						<p className="dm-home-lede">
							Plan your sessions and party&apos;s campaign from saved and public content.
						</p>

						<section className="dm-home-section" aria-label="My campaigns">
							<h2>My campaigns</h2>
							{campaignError ? <p className="dm-home-error" role="alert">{campaignError}</p> : null}
							{campaigns.length === 0 ? (
								<p className="dm-home-empty">Create a campaign to begin planning your modules.</p>
							) : (
								<div className="search-results-grid dm-home-saved-grid">
									{campaigns.map((campaign) => (
										<CampaignCard
											key={campaign._id}
											campaign={campaign}
											onSelect={() => void selectCampaign(campaign)}
										/>
									))}
								</div>
							)}
							<button
								type="button"
								className="dm-home-secondary-button"
								onClick={() => {
									setCreateCampaignError('');
									setIsCreateDialogOpen(true);
								}}
							>
								Create Campaign
							</button>
						</section>

						<section className="dm-home-section" aria-label="Saved content">
							<h2>Saved content</h2>
							{isLoading ? <p>Loading saved content…</p> : null}
							{error ? (
								<p className="dm-home-error" role="alert">
									{error}
								</p>
							) : null}
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
								onAddToCampaign={() =>
									setCampaignPickerSource({
										id: moduleId,
										title: module.title,
										startingLevel: module.startingLevel,
										endingLevel: module.endingLevel
									})
								}
												onSelect={() => openSavedModule(moduleId)}
											/>
										);
									})}
								</div>
							) : null}
						</section>
						{selectedCampaign ? (
							<CampaignEditor
								campaign={selectedCampaign}
								onChange={handleCampaignChange}
								onInsertModule={(index) => setInsertIndex(index)}
								onRemoveModule={removeModuleFromSelectedCampaign}
								onSave={handleManualCampaignSave}
								saveStatus={campaignSaveStatus}
								saveMessage={campaignSaveMessage}
							/>
						) : (
							<section className="dm-home-section" aria-label="Campaign editor">
								<p className="dm-home-empty">
									Select or create a campaign to order and prepare it for your players.
								</p>
							</section>
						)}
					</>
				) : (
					<SessionManagerPanel
						campaigns={campaigns}
						selectedCampaign={sessionCampaign}
						isLoading={isLoading}
						error={campaignError}
						onSelectCampaign={(campaign) => setSessionCampaignId(campaign._id)}
						onClearCampaign={() => setSessionCampaignId(null)}
					/>
				)}
			</div>
			<CreateCampaignDialog
				isOpen={isCreateDialogOpen}
				isSubmitting={isCreatingCampaign}
				error={createCampaignError}
				onClose={() => !isCreatingCampaign && setIsCreateDialogOpen(false)}
				onCreate={(title) => void handleCreateCampaign(title)}
			/>
			<InsertModuleDialog
				isOpen={insertIndex !== null}
				favorites={favorites}
				onClose={() => setInsertIndex(null)}
				onInsert={insertModuleIntoSelectedCampaign}
				onView={openSavedModule}
			/>
			<CampaignModulePickerDialog
				isOpen={campaignPickerSource !== null}
				source={campaignPickerSource}
				onClose={() => setCampaignPickerSource(null)}
				onCampaignUpdated={(campaign) => {
					handleCampaignUpdated(campaign);
					setCampaignPickerSource(null);
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

export default DmHomePage;
