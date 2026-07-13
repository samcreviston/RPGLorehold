import type { Open5eDetailViewModel } from '../../lib/open5e/open5eDetailTypes';
import './open5e-detail-card.css';

type Open5eDetailCardProps = {
	detail: Open5eDetailViewModel;
};

export default function Open5eDetailCard({ detail }: Open5eDetailCardProps) {
	return (
		<article className="open5e-detail-card">
			<header className="open5e-detail-card__heading">
				<h1>{detail.title}</h1>
				{detail.subtitle ? <h2>{detail.subtitle}</h2> : null}
			</header>

			{detail.lines.length > 0 ? (
				<div className="open5e-detail-card__lines">
					{detail.lines.map((line) => (
						<div key={`${line.label}-${line.value}`} className="open5e-detail-card__line">
							<strong>{line.label}</strong>
							<span>{line.value}</span>
						</div>
					))}
				</div>
			) : null}

			{detail.description ? (
				<div className="open5e-detail-card__description">
					{detail.description.split(/\n\n+/).map((paragraph, index) => (
						<p key={`desc-${index}`}>{paragraph}</p>
					))}
				</div>
			) : null}

			{detail.sections.map((section) => (
				<section key={section.title} className="open5e-detail-card__section">
					<h3>{section.title}</h3>
					{section.blocks.map((block, index) => (
						<div key={`${block.name}-${index}`} className="open5e-detail-card__block">
							<strong>{block.name}.</strong>
							{block.desc ? <p>{block.desc}</p> : null}
						</div>
					))}
				</section>
			))}
		</article>
	);
}
