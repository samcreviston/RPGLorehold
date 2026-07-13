import { useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import './dm-home-page.css';

function DmHomePage() {
	const navigate = useNavigate();

	usePageMeta({
		title: 'DM Home',
		description: 'View saved content and campaigns built from your modules.',
		path: '/dm-home'
	});

	return (
		<main className="page-main dm-home-page">
			<h1>DM Home</h1>
			<p className="dm-home-lede">
				Your saved content and campaigns will live here. Campaign lists of modules are coming next.
			</p>

			<section className="dm-home-section" aria-label="Saved content">
				<h2>Saved content</h2>
				<p className="dm-home-empty">No saved modules yet.</p>
			</section>

			<section className="dm-home-section" aria-label="My campaigns">
				<h2>My campaigns</h2>
				<p className="dm-home-empty">No campaigns yet. Campaign creation is coming soon.</p>
				<button type="button" className="dm-home-secondary-button" onClick={() => navigate('/creator/home')}>
					Go to Creator Home
				</button>
			</section>
		</main>
	);
}

export default DmHomePage;
