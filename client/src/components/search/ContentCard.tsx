import type { KeyboardEvent } from 'react';
import type { ContentSearchHit } from '../../api/search';
import './module-card.css';

type ContentCardProps = {
	hit: ContentSearchHit;
	onSelect: () => void;
};

function metadata(hit: ContentSearchHit): string {
	const values = [
		hit.typeLabel,
		hit.contentType === 'monster' || hit.contentType === 'npcStats'
			? [hit.size, hit.creatureType, hit.alignment].filter(Boolean).join(' ')
			: '',
		hit.className ? `${hit.className}${hit.level !== undefined ? ` ${hit.level}` : ''}` : '',
		hit.ancestry ?? '',
		hit.rarity ?? '',
		hit.damageDice ? `${hit.damageDice}${hit.damageType ? ` ${hit.damageType}` : ''}` : '',
		hit.armorClass ? `AC ${hit.armorClass}` : '',
		hit.spellSchool ? `${hit.level === 0 ? 'Cantrip' : `Level ${hit.level ?? ''}`} ${hit.spellSchool}` : '',
		hit.cost ?? ''
	].filter(Boolean);
	return values.join(' · ');
}

function ContentCard({ hit, onSelect }: ContentCardProps) {
	return (
		<article
			className={`search-result-card search-result-card--interactive content-result-card content-result-card--${hit.searchCategory}`}
			role="button"
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect();
				}
			}}
		>
			<header className="search-result-card__header">
				<h3>{hit.title}</h3>
			</header>
			<p className="search-result-card__attributes">{metadata(hit)}</p>
			<p>{hit.description || hit.detail || 'No description provided.'}</p>
		</article>
	);
}

export default ContentCard;
