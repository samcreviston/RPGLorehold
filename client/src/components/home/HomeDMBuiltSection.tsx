import { Link } from 'react-router-dom';

function HomeDMBuiltSection() {
	return (
		<section id="dm-built" className="home-section" aria-labelledby="dm-built-heading">
			<h2 id="dm-built-heading">DM Built</h2>
			<div className="home-two-column-grid">
				<div className="home-video-placeholder" role="img" aria-label="DM tools demo video area">
					DM tools demo video area
				</div>
				<div className="home-stacked-notes">
					<h3>Stat blocks</h3>
					<p>Hover over to see and pin stats of monsters and NPCs.</p>
					<h3>Session Tools</h3>
					<p>Initiative Tracker, DC Calculator, your notes, and more.</p>
					<h3>DM Notes</h3>
					<p>Distinct notes separated just for the DM.</p>
				</div>
			</div>
			<Link to="/search" className="home-section__button">
				Begin searching content
			</Link>
		</section>
	);
}

export default HomeDMBuiltSection;

