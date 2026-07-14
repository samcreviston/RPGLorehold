import { useEffect, useState } from 'react';
import { createCampaign, listCampaigns, updateCampaign } from '../../api/campaigns';
import type { Campaign, CampaignEntry } from '../../types/campaign';
import CreateCampaignDialog from './CreateCampaignDialog';
import './campaign-picker.css';

export type CampaignModuleSource = {
	id: string;
	title: string;
	startingLevel: number;
	endingLevel: number;
};

type CampaignModulePickerDialogProps = {
	isOpen: boolean;
	source: CampaignModuleSource | null;
	onClose: () => void;
	onCampaignUpdated: (campaign: Campaign) => void;
};

function createEntry(source: CampaignModuleSource): CampaignEntry {
	return {
		id: crypto.randomUUID(),
		moduleId: source.id,
		plannedStartingLevel: source.startingLevel,
		plannedEndingLevel: source.endingLevel,
		dmNotes: '',
		module: null,
		authorUsername: ''
	};
}

function CampaignModulePickerDialog({
	isOpen,
	source,
	onClose,
	onCampaignUpdated
}: CampaignModulePickerDialogProps) {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setSelectedCampaign(null);
			setError('');
			return;
		}
		let cancelled = false;
		setIsLoading(true);
		void listCampaigns()
			.then((items) => {
				if (!cancelled) setCampaigns(items);
			})
			.catch((err: unknown) => {
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load campaigns.');
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || isCreateOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, isCreateOpen, onClose]);

	if (!isOpen || !source) {
		return null;
	}

	async function insertIntoCampaign(campaign: Campaign, index: number) {
		if (!source) return;
		setIsSaving(true);
		setError('');
		try {
			const entries = campaign.entries.slice();
			entries.splice(index, 0, createEntry(source));
			const saved = await updateCampaign(campaign._id, {
				title: campaign.title,
				entries: entries.map(({ id, moduleId, plannedStartingLevel, plannedEndingLevel, dmNotes }) => ({
					id,
					moduleId,
					plannedStartingLevel,
					plannedEndingLevel,
					dmNotes
				}))
			});
			onCampaignUpdated(saved);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add module to campaign.');
		} finally {
			setIsSaving(false);
		}
	}

	async function selectCampaign(campaign: Campaign) {
		if (campaign.entries.length === 0) {
			await insertIntoCampaign(campaign, 0);
			return;
		}
		setSelectedCampaign(campaign);
	}

	async function insertAt(index: number) {
		if (!selectedCampaign) return;
		await insertIntoCampaign(selectedCampaign, index);
	}

	async function handleCreate(title: string) {
		setIsCreating(true);
		try {
			const campaign = await createCampaign(title);
			setCampaigns((previous) => [campaign, ...previous]);
			setSelectedCampaign(campaign);
			setIsCreateOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create campaign.');
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<div className="campaign-picker-backdrop" role="presentation" onMouseDown={onClose}>
			<section
				className="campaign-picker"
				role="dialog"
				aria-modal="true"
				aria-labelledby="campaign-picker-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				{selectedCampaign ? (
					<>
						<button type="button" className="campaign-picker__back" onClick={() => setSelectedCampaign(null)}>
							← Back
						</button>
						<h2 id="campaign-picker-title">Add {source.title} to {selectedCampaign.title}</h2>
						<p>Select where to add this module.</p>
						<div className="campaign-picker__positions">
							<button
								type="button"
								className="dm-home-secondary-button"
								disabled={isSaving}
								onClick={() => void insertAt(0)}
							>
								Add module here
							</button>
							{selectedCampaign.entries.map((entry, index) => (
								<div key={entry.id} className="campaign-picker__campaign-entry">
									<p>{entry.module?.title ?? 'Unavailable module'}</p>
									<button
										type="button"
										className="dm-home-secondary-button"
										disabled={isSaving}
										onClick={() => void insertAt(index + 1)}
									>
										Add module here
									</button>
								</div>
							))}
						</div>
					</>
				) : (
					<>
						<button type="button" className="campaign-picker__back" onClick={onClose}>
							← Back
						</button>
						<h2 id="campaign-picker-title">Add {source.title} to</h2>
						{isLoading ? <p>Loading campaigns…</p> : null}
						{campaigns.map((campaign) => (
							<button
								key={campaign._id}
								type="button"
								className="campaign-picker__campaign"
								disabled={isSaving}
								onClick={() => void selectCampaign(campaign)}
							>
								{campaign.title}
							</button>
						))}
						<button type="button" className="dm-home-secondary-button" onClick={() => setIsCreateOpen(true)}>
							Create Campaign
						</button>
					</>
				)}
				{error ? <p className="campaign-picker__error" role="alert">{error}</p> : null}
			</section>
			<CreateCampaignDialog
				isOpen={isCreateOpen}
				isSubmitting={isCreating}
				error={error}
				onClose={() => !isCreating && setIsCreateOpen(false)}
				onCreate={(title) => void handleCreate(title)}
			/>
		</div>
	);
}

export default CampaignModulePickerDialog;
