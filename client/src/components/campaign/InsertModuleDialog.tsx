import { useEffect } from 'react';
import type { FavoriteModuleItem } from '../../api/favorites';
import ModuleCard from '../search/ModuleCard';
import { formatModuleCardAttributes } from '../../utils/formatModuleCardAttributes';
import type { CampaignModuleSource } from './CampaignModulePickerDialog';
import './campaign-picker.css';

type InsertModuleDialogProps = {
	isOpen: boolean;
	favorites: FavoriteModuleItem[];
	onClose: () => void;
	onInsert: (source: CampaignModuleSource) => void;
	onView: (moduleId: string) => void;
};

function InsertModuleDialog({
	isOpen,
	favorites,
	onClose,
	onInsert,
	onView
}: InsertModuleDialogProps) {
	useEffect(() => {
		if (!isOpen) {
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
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="campaign-picker-backdrop" role="presentation" onMouseDown={onClose}>
			<section
				className="campaign-picker"
				role="dialog"
				aria-modal="true"
				aria-labelledby="insert-module-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<button type="button" className="campaign-picker__back" onClick={onClose}>
					← Back
				</button>
				<h2 id="insert-module-title">Insert Module</h2>
				{favorites.length === 0 ? <p>No saved modules yet.</p> : null}
				<div className="search-results-grid">
					{favorites.map(({ module, authorUsername }) => (
						<ModuleCard
							key={module._id}
							contentName={module.title}
							attributes={formatModuleCardAttributes({
								startingLevel: module.startingLevel,
								endingLevel: module.endingLevel,
								playstyle: module.playstyle,
								biomes: module.biomes,
								authorUsername
							})}
							flavorText={module.flavorText}
							isFavorited
							onView={() => onView(module._id)}
							onAddToCampaign={() =>
								onInsert({
									id: module._id,
									title: module.title,
									startingLevel: module.startingLevel,
									endingLevel: module.endingLevel
								})
							}
						/>
					))}
				</div>
			</section>
		</div>
	);
}

export default InsertModuleDialog;
