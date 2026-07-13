import type { MouseEvent as ReactMouseEvent } from 'react';
import ContentWindowTool from '../content/ContentWindowTool';
import { useContentWindow } from '../../hooks/useContentWindow';
import {
	isPreviewBlockEmpty,
	type ModulePreviewAdventure
} from '../../utils/modulePreviewModel';
import './module-preview.css';

type ModulePreviewViewProps = {
	title: string;
	authorName: string;
	adventures: ModulePreviewAdventure[];
	emptyMessage?: string;
	/** When provided, uses an external Content Window instead of creating one. */
	contentWindow?: ReturnType<typeof useContentWindow>;
};

function ModulePreviewView({
	title,
	authorName,
	adventures,
	emptyMessage = 'No module content to display.',
	contentWindow: externalContentWindow
}: ModulePreviewViewProps) {
	const internalContentWindow = useContentWindow();
	const contentWindow = externalContentWindow ?? internalContentWindow;

	const hasContent =
		title.trim().length > 0 ||
		adventures.some((adventure) => adventure.blocks.some((block) => !isPreviewBlockEmpty(block)));

	if (!hasContent) {
		return <p className="module-preview-empty">{emptyMessage}</p>;
	}

	const handlePreviewContentLinkClick = (event: ReactMouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement | null;
		const link = target?.closest<HTMLElement>('[data-content-link]');
		if (!link || !event.currentTarget.contains(link)) {
			return;
		}

		event.preventDefault();
		const href = link.getAttribute('data-content-link')?.trim() ?? '';
		const contentKey = link.getAttribute('data-content-key')?.trim() || undefined;
		if (!href) {
			return;
		}
		contentWindow.openContentLinkInWindow(href, contentKey);
	};

	return (
		<div className="module-preview-workspace">
			<article
				className="module-preview"
				aria-label="Module preview"
				onClick={handlePreviewContentLinkClick}
			>
				<header className="module-preview__header">
					<h2 className="module-preview__title">{title.trim() || 'Untitled Module'}</h2>
					<p className="module-preview__author">{authorName}</p>
				</header>

				{adventures.map((adventure) => {
					const visibleBlocks = adventure.blocks.filter((block) => !isPreviewBlockEmpty(block));
					if (visibleBlocks.length === 0) {
						return null;
					}

					return (
						<section
							key={adventure.id}
							className="module-preview__adventure"
							aria-label={adventure.title.trim() || 'Adventure'}
						>
							{adventure.title.trim() ? (
								<h3 className="module-preview__adventure-title">{adventure.title.trim()}</h3>
							) : null}
							{visibleBlocks.map((block) => {
								if (block.type === 'imageMap') {
									const imageSrc = block.imageID?.trim() || block.content.trim();
									if (!imageSrc) {
										return null;
									}
									return (
										<figure key={block.id} className="module-preview__figure">
											<img
												className="module-preview__image"
												src={imageSrc}
												alt={block.caption?.trim() || 'Module illustration'}
											/>
											{block.caption?.trim() ? (
												<figcaption className="module-preview__caption">
													{block.caption.trim()}
												</figcaption>
											) : null}
										</figure>
									);
								}

								return (
									<div
										key={block.id}
										className={`module-preview__block module-preview__block--${block.type}`}
										dangerouslySetInnerHTML={{ __html: block.content }}
									/>
								);
							})}
						</section>
					);
				})}
			</article>
			<aside className="module-preview-sidebar" aria-label="Content Window">
				<ContentWindowTool
					isOpen={contentWindow.isContentWindowOpen}
					onToggleOpen={() =>
						contentWindow.setIsContentWindowOpen((previous) => !previous)
					}
					status={contentWindow.contentWindowStatus}
					error={contentWindow.contentWindowError}
					creature={contentWindow.contentWindowCreature}
					detail={contentWindow.contentWindowDetail}
				/>
			</aside>
		</div>
	);
}

export default ModulePreviewView;
