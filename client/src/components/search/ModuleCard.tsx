import type { KeyboardEvent } from 'react';

type SearchResultCardProps = {
	contentName: string;
	attributes: string;
	flavorText: string;
	onSelect?: () => void;
};

function ModuleCard({ contentName, attributes, flavorText, onSelect }: SearchResultCardProps) {
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
				<button
					type="button"
					aria-label={`Favorite ${contentName}`}
					onClick={(event) => event.stopPropagation()}
				>
					Star
				</button>
			</header>
			<p className="search-result-card__attributes">{attributes}</p>
			<p>{flavorText}</p>
		</article>
	);
}

export default ModuleCard;
