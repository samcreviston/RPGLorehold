import { useState } from 'react';
import ModulePreviewView from '../module/ModulePreviewView';
import type { Campaign, CampaignEntry } from '../../types/campaign';
import { adventuresFromModuleDocument } from '../../utils/modulePreviewModel';

type CampaignSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type CampaignEditorProps = {
	campaign: Campaign;
	onChange: (campaign: Campaign) => void;
	onInsertModule: (index: number) => void;
	onRemoveModule: (entryId: string) => void;
	onSave: () => void;
	saveStatus: CampaignSaveStatus;
	saveMessage: string;
};

function CampaignEditor({
	campaign,
	onChange,
	onInsertModule,
	onRemoveModule,
	onSave,
	saveStatus,
	saveMessage
}: CampaignEditorProps) {
	const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

	function updateEntry(id: string, update: Partial<CampaignEntry>) {
		onChange({
			...campaign,
			entries: campaign.entries.map((entry) => (entry.id === id ? { ...entry, ...update } : entry))
		});
	}

	function moveEntry(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= campaign.entries.length) {
			return;
		}
		const entries = campaign.entries.slice();
		const sourceEntry = entries[index];
		const targetEntry = entries[target];
		if (!sourceEntry || !targetEntry) {
			return;
		}
		entries[index] = targetEntry;
		entries[target] = sourceEntry;
		onChange({ ...campaign, entries });
	}

	function parseLevel(value: string, fallback: number): number {
		const level = Number(value);
		return Number.isInteger(level) && level >= 1 && level <= 20 ? level : fallback;
	}

	return (
		<section className="dm-home-section campaign-editor" aria-label={`${campaign.title} campaign plan`}>
			<div className="campaign-editor__heading">
				<div>
					<h2>{campaign.title}</h2>
					<p className="dm-home-empty">Campaign modules and DM planning notes.</p>
				</div>
			</div>
			{campaign.entries.length === 0 ? (
				<div className="campaign-editor__empty">
					<p className="dm-home-empty">No modules have been added to this campaign yet.</p>
					<button
						type="button"
						className="dm-home-secondary-button"
						onClick={() => onInsertModule(0)}
					>
						Insert Module
					</button>
				</div>
			) : (
				campaign.entries.map((entry, index) => {
					const collapsed = collapsedIds.has(entry.id);
					const module = entry.module;
					const title = module?.title ?? 'Unavailable module';
					return (
						<div key={entry.id} className="campaign-editor__entry">
							<article className={`campaign-module${collapsed ? ' campaign-module--collapsed' : ''}`}>
								<header className="campaign-module__bar">
								{collapsed ? <h3 className="campaign-module__title">{title}</h3> : null}
								<div className="campaign-module__controls">
									<button
										type="button"
										className="campaign-module__remove"
										aria-label={`Remove ${title} from campaign`}
										onClick={() => onRemoveModule(entry.id)}
									>
										Remove Module
									</button>
									<div className="campaign-module__reorder">
										<span>Reorder Module</span>
										<button
											type="button"
											aria-label={`Move ${title} up`}
											disabled={index === 0}
											onClick={() => moveEntry(index, -1)}
										>
											↑
										</button>
										<button
											type="button"
											aria-label={`Move ${title} down`}
											disabled={index === campaign.entries.length - 1}
											onClick={() => moveEntry(index, 1)}
										>
											↓
										</button>
									</div>
									<label className="campaign-module__levels">
										<span>Levels planned for</span>
										<input
											type="number"
											min="1"
											max="20"
											value={entry.plannedStartingLevel}
											onChange={(event) =>
												updateEntry(entry.id, {
													plannedStartingLevel: parseLevel(
														event.target.value,
														entry.plannedStartingLevel
													)
												})
											}
										/>
										<span>to</span>
										<input
											type="number"
											min={entry.plannedStartingLevel}
											max="20"
											value={entry.plannedEndingLevel}
											onChange={(event) =>
												updateEntry(entry.id, {
													plannedEndingLevel: Math.max(
														entry.plannedStartingLevel,
														parseLevel(event.target.value, entry.plannedEndingLevel)
													)
												})
											}
										/>
									</label>
									<button
										type="button"
										className="campaign-module__collapse"
										aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}
										aria-expanded={!collapsed}
										onClick={() =>
											setCollapsedIds((previous) => {
												const next = new Set(previous);
												if (next.has(entry.id)) next.delete(entry.id);
												else next.add(entry.id);
												return next;
											})
										}
									>
										{collapsed ? '⌄' : '⌃'}
									</button>
								</div>
								{!collapsed ? (
									<label className="campaign-module__notes">
										<span>Module Notes</span>
										<textarea
											value={entry.dmNotes}
											placeholder="DM-only notes for this module"
											onChange={(event) => updateEntry(entry.id, { dmNotes: event.target.value })}
										/>
									</label>
								) : null}
								</header>
								{!collapsed && module ? (
									<ModulePreviewView
										title={module.title}
										authorName={entry.authorUsername.trim() || 'Unknown author'}
										adventures={adventuresFromModuleDocument(module)}
									/>
								) : null}
							</article>
							<button
								type="button"
								className="dm-home-secondary-button campaign-editor__insert"
								onClick={() => onInsertModule(index + 1)}
							>
								Insert Module
							</button>
						</div>
					);
				})
			)}
			<div className="campaign-editor__save" aria-label="Save campaign">
				<button
					type="button"
					className="dm-home-secondary-button"
					onClick={onSave}
					disabled={saveStatus === 'saving'}
				>
					{saveStatus === 'saving' ? 'Saving…' : 'Save Campaign'}
				</button>
				<p
					className={`campaign-editor__save-status campaign-editor__save-status--${saveStatus}`}
					aria-live="polite"
				>
					{saveMessage}
				</p>
			</div>
		</section>
	);
}

export default CampaignEditor;
