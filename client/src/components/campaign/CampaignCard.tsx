import type { Campaign } from '../../types/campaign';
import type { ModuleDocument, Playstyle } from '../../types/module';

type CampaignCardProps = {
	campaign: Campaign;
	onSelect: () => void;
};

function mergeRanges(ranges: Array<[number, number]>): string {
	if (ranges.length === 0) {
		return 'No modules';
	}

	const sorted = ranges.slice().sort(([a], [b]) => a - b);
	const merged: Array<[number, number]> = [];
	for (const [start, end] of sorted) {
		const previous = merged[merged.length - 1];
		if (previous && start <= previous[1] + 1) {
			previous[1] = Math.max(previous[1], end);
		} else {
			merged.push([start, end]);
		}
	}
	return merged.map(([start, end]) => (start === end ? String(start) : `${start}-${end}`)).join(', ');
}

function aggregatePlaystyle(campaign: Campaign): string {
	const values = campaign.entries
		.map((entry) => entry.module?.playstyle)
		.filter((playstyle): playstyle is Playstyle => Boolean(playstyle));
	if (values.length === 0) {
		return 'No modules';
	}
	const scores = { 'More Roleplay': -1, Balanced: 0, 'More Combat': 1 } as const;
	const total = values.reduce((sum, value) => sum + scores[value], 0);
	return total < 0 ? 'More Roleplay' : total > 0 ? 'More Combat' : 'Balanced';
}

function CampaignCard({ campaign, onSelect }: CampaignCardProps) {
	const modules = campaign.entries
		.map((entry) => entry.module)
		.filter((module): module is ModuleDocument => module !== null);
	const authors = new Set(
		campaign.entries.map((entry) => entry.authorUsername.trim()).filter((author) => author.length > 0)
	);
	const author = authors.size === 1 ? [...authors][0] : '';
	const levels = mergeRanges(
		modules.map((module) => [module.startingLevel, module.endingLevel] as [number, number])
	);

	return (
		<article
			className="search-result-card search-result-card--interactive campaign-card"
			role="button"
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect();
				}
			}}
		>
			<header className="search-result-card__header">
				<h3>{campaign.title}</h3>
			</header>
			<p className="search-result-card__attributes">
				Levels {levels} · {aggregatePlaystyle(campaign)}
				{author ? ` · By ${author}` : ''}
			</p>
			<p>{campaign.entries.length === 1 ? '1 module planned' : `${campaign.entries.length} modules planned`}</p>
		</article>
	);
}

export default CampaignCard;
