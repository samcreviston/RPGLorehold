import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/layout.css';

type NavigationLink = {
	label: string;
	path: string;
};

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navigationLinks = useMemo<NavigationLink[]>(
		() => [
			{ label: 'Home', path: '/' },
			{ label: 'Search', path: '/search' },
			{ label: 'Creator', path: '/creator' },
			{ label: 'Creator Home', path: '/creator/home' },
			{ label: 'Content', path: '/content' },
			{ label: 'User', path: '/user' }
		],
		[]
	);

	return (
		<header className="site-header">
			<div className="site-header__top">
				<div>
					<p className="site-header__kicker">RPG Content Platform</p>
					<p className="site-header__title" aria-label="RPGLorehold site brand">
						RPGLorehold
					</p>
				</div>
				<button
					type="button"
					className="site-header__menu-button"
					onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
					aria-expanded={isMenuOpen}
					aria-controls="site-navigation"
					aria-label="Toggle navigation menu"
				>
					Menu
				</button>
			</div>
			<nav id="site-navigation" className="site-nav" aria-label="Primary site navigation">
				<ul className={`site-nav__list ${isMenuOpen ? 'site-nav__list--open' : ''}`}>
					{navigationLinks.map((navigationLink) => (
						<li key={navigationLink.path}>
							<NavLink
								to={navigationLink.path}
								onClick={() => setIsMenuOpen(false)}
								className={({ isActive }) =>
									`site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
								}
							>
								{navigationLink.label}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>
		</header>
	);
}

export default Header;

