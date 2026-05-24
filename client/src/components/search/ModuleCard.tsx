type SearchResultCardProps = {
	contentName: string;
	attributes: string;
	flavorText: string;
};

function ModuleCard({ contentName, attributes, flavorText }: SearchResultCardProps) {
	return (
		<article className="search-result-card">
			<header className="search-result-card__header">
				<h3>{contentName}</h3>
				<button type="button" aria-label={`Favorite ${contentName}`}>
					Star
				</button>
			</header>
			<p className="search-result-card__attributes">{attributes}</p>
			<p>{flavorText}</p>
		</article>
	);
}

export default ModuleCard;

