import { Link } from 'react-router-dom';

function HomeCreationSpaceSection() {
	return (
		<section
			id="seamless-creation-space"
			className="home-section"
			aria-labelledby="seamless-creation-heading"
		>
			<h2 id="seamless-creation-heading">Seamless Story Creation Space</h2>
			<div className="home-two-column-grid">
				<div className="home-stacked-notes">
					<h3>Select and swap text block types</h3>
					<p>Story, DM Note, setting.</p>
					<h3>Attach descriptions directly to text</h3>
					<p>Monsters, NPCs, items, and more.</p>
					<h3>Select all applicable content labels</h3>
					<p>Party levels, number of adventures, biomes, and more.</p>
				</div>
				<div
					className="home-video-placeholder"
					role="img"
					aria-label="Content creation demo video area"
				>
					Creation flow demo video area
				</div>
			</div>
			<Link to="/creator" className="home-section__button">
				Begin creating content
			</Link>
		</section>
	);
}

export default HomeCreationSpaceSection;

