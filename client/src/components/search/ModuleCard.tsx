import type { KeyboardEvent } from 'react';
import './module-card.css';

type SearchResultCardProps = {
	contentName: string;
	attributes: string;
	flavorText: string;
	isFavorited?: boolean;
	onFavoriteToggle?: () => void;
	onAddToCampaign?: () => void;
	onView?: () => void;
	onSelect?: () => void;
};

function FavoriteStarIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			className="search-result-card__favorite-icon"
			viewBox="0 0 24 24"
			width="16"
			height="16"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94L12 2.5z"
				fill={filled ? 'currentColor' : 'none'}
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ModuleCard({
	contentName,
	attributes,
	flavorText,
	isFavorited = false,
	onFavoriteToggle,
	onAddToCampaign,
	onView,
	onSelect
}: SearchResultCardProps) {
	const interactive = Boolean(onSelect);

	return (
		<article
			className={`search-result-card${interactive ? ' search-result-card--interactive' : ''}`}
			{...(interactive
				? {
						role: 'button' as const,
						tabIndex: 0,
						onClick: onSelect,
						onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								onSelect?.();
							}
						}
					}
				: {})}
		>
			<header className="search-result-card__header">
				<h3>{contentName}</h3>
				<div className="search-result-card__actions">
					{onView ? (
						<button
							type="button"
							className="search-result-card__view"
							onClick={(event) => {
								event.stopPropagation();
								onView();
							}}
						>
							View
						</button>
					) : null}
					{onAddToCampaign ? (
						<button
							type="button"
							className="search-result-card__campaign-add"
							aria-label={`Add ${contentName} to a Campaign`}
							title="Add to a Campaign"
							onClick={(event) => {
								event.stopPropagation();
								onAddToCampaign();
							}}
						>
							+
						</button>
					) : null}
					<button
						type="button"
						className={`search-result-card__favorite${isFavorited ? ' search-result-card__favorite--active' : ''}`}
						aria-label={isFavorited ? `Unfavorite ${contentName}` : `Favorite ${contentName}`}
						aria-pressed={isFavorited}
						onClick={(event) => {
							event.stopPropagation();
							onFavoriteToggle?.();
						}}
					>
						<span>Favorite</span>
						<FavoriteStarIcon filled={isFavorited} />
					</button>
				</div>
			</header>
			<p className="search-result-card__attributes">{attributes}</p>
			<p>{flavorText}</p>
		</article>
	);
}

export default ModuleCard;
