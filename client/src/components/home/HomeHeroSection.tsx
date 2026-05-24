import { Link } from 'react-router-dom';

type HomeHeroSectionProps = {
	onShortcutClick?: () => void;
};

function HomeHeroSection({ onShortcutClick }: HomeHeroSectionProps) {
	return (
		<section className="home-hero" aria-labelledby="home-hero-heading">
			<h1 id="home-hero-heading">Welcome to RPGLorehold!</h1>
			<p>
				The useful DM, player, and content creator hub for published homebrew RPG content.
				From modules and campaigns, to items, NPC stat blocks, and more, RPGLorehold has
				integrated tools for epic content with maps, rolls, checks, and exploration support.
			</p>
			<div className="home-hero__actions" aria-label="Begin actions">
				<Link to="/search" className="home-hero__primary-button" onClick={onShortcutClick}>
					Begin Searching
				</Link>
				<Link to="/creator" className="home-hero__primary-button" onClick={onShortcutClick}>
					Begin Creating
				</Link>
			</div>
			<div className="home-hero__shortcuts" aria-label="Home section shortcuts">
				<a href="#seamless-creation-space">Seamless Creation Space</a>
				<a href="#dm-built">DM Built</a>
				<a href="#advanced-search">Advanced Search</a>
			</div>
		</section>
	);
}

export default HomeHeroSection;

