import ModulePreviewView from '../module/ModulePreviewView';
import type { Campaign } from '../../types/campaign';
import { adventuresFromModuleDocument } from '../../utils/modulePreviewModel';

type SessionManagerPanelProps = {
	campaigns: Campaign[];
	selectedCampaign: Campaign | null;
	isLoading: boolean;
	error: string;
	onSelectCampaign: (campaign: Campaign) => void;
	onClearCampaign: () => void;
};

function SessionManagerPanel({
	campaigns,
	selectedCampaign,
	isLoading,
	error,
	onSelectCampaign,
	onClearCampaign
}: SessionManagerPanelProps) {
	return (
		<>
			<h1>Session Manager</h1>
			<p className="dm-home-lede">Run your prepared campaign modules in order at the table.</p>

			<section className="dm-home-section campaign-select" aria-label="Campaign select">
				<h2>Campaign</h2>
				{isLoading ? <p>Loading campaigns…</p> : null}
				{error ? (
					<p className="dm-home-error" role="alert">
						{error}
					</p>
				) : null}
				{!isLoading && !error && campaigns.length === 0 ? (
					<p className="dm-home-empty">Create a campaign in Campaign Planner to use it here.</p>
				) : null}
				{campaigns.length > 0 ? (
					<ul className="campaign-select__list">
						{campaigns.map((campaign) => {
							const isSelected = selectedCampaign?._id === campaign._id;
							return (
								<li key={campaign._id}>
									<button
										type="button"
										className={`campaign-select__option${isSelected ? ' campaign-select__option--selected' : ''}`}
										aria-pressed={isSelected}
										onClick={() => onSelectCampaign(campaign)}
									>
										{campaign.title}
									</button>
								</li>
							);
						})}
					</ul>
				) : null}
				{selectedCampaign ? (
					<button type="button" className="campaign-select__clear" onClick={onClearCampaign}>
						Clear selection
					</button>
				) : null}
			</section>

			{selectedCampaign ? (
				<section
					className="dm-home-section session-campaign"
					aria-label={`${selectedCampaign.title} session`}
				>
					<div className="session-campaign__heading">
						<h2>{selectedCampaign.title}</h2>
					</div>
					{selectedCampaign.entries.length === 0 ? (
						<p className="dm-home-empty">This campaign has no modules yet.</p>
					) : (
						<div className="session-campaign__modules">
							{selectedCampaign.entries.map((entry) => {
								const module = entry.module;
								if (!module) {
									return (
										<article key={entry.id} className="session-campaign__unavailable" aria-label="Unavailable module">
											<h3 className="module-preview__title">Unavailable module</h3>
											{entry.dmNotes.trim() ? (
												<p className="module-preview__dm-notes">{entry.dmNotes.trim()}</p>
											) : null}
										</article>
									);
								}

								return (
									<ModulePreviewView
										key={entry.id}
										title={module.title}
										authorName={entry.authorUsername.trim() || 'Unknown author'}
										dmNotes={entry.dmNotes}
										adventures={adventuresFromModuleDocument(module)}
										emptyMessage="This module has no content to display."
									/>
								);
							})}
						</div>
					)}
				</section>
			) : null}
		</>
	);
}

export default SessionManagerPanel;
