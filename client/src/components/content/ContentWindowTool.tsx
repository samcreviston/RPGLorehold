import CreatureStatBlock from './CreatureStatBlock';
import Open5eDetailCard from './Open5eDetailCard';
import type { MappedCreatureStatblock } from '../../lib/open5e/creatureTypes';
import type { Open5eDetailViewModel } from '../../lib/open5e/open5eDetailTypes';
import './content-window-tool.css';

type ContentWindowToolProps = {
	isOpen: boolean;
	onToggleOpen: () => void;
	status: 'idle' | 'loading' | 'error';
	error: string;
	creature: MappedCreatureStatblock | null;
	detail: Open5eDetailViewModel | null;
	isGeneratedContent?: boolean;
	onGeneratedContentViewed?: () => void;
};

function ContentWindowTool({
	isOpen,
	onToggleOpen,
	status,
	error,
	creature,
	detail,
	isGeneratedContent = false,
	onGeneratedContentViewed
}: ContentWindowToolProps) {
	return (
		<section
			className={`sidebar-tool-card content-window-tool${isOpen ? '' : ' sidebar-tool-card--collapsed'}${isGeneratedContent ? ' content-window-tool--generated' : ''}`}
			aria-label="Content Window"
			onAnimationEnd={isGeneratedContent ? onGeneratedContentViewed : undefined}
		>
			<div className="section-card-heading">
				<h4>Content Window</h4>
				<button
					type="button"
					className="section-collapse-button"
					aria-expanded={isOpen}
					aria-label={isOpen ? 'Collapse Content Window' : 'Expand Content Window'}
					onClick={onToggleOpen}
				>
					{isOpen ? '▾' : '▸'}
				</button>
			</div>
			{isOpen ? (
				<div className="content-window-body">
					{status === 'loading' ? (
						<p className="content-results-empty">Loading content…</p>
					) : status === 'error' ? (
						<p className="content-results-empty">{error}</p>
					) : creature ? (
						<CreatureStatBlock creature={creature} />
					) : detail ? (
						<Open5eDetailCard detail={detail} />
					) : (
						<p className="content-results-empty">Click a linked content tag to view it here.</p>
					)}
				</div>
			) : null}
		</section>
	);
}

export default ContentWindowTool;
