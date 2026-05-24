import usePageMeta from '../hooks/usePageMeta';
import './creator-home-page.css';

function CreatorHomePage() {
	usePageMeta({
		title: 'Creator Home',
		description: 'Review your in-progress and published RPG content before opening the creator workflow.',
		path: '/creator/home'
	});

	return (
		<main className="page-main creator-home-page">
			<h1>Creator Home Page</h1>
			<p>
				This page will list your in-progress and published content with quick management actions.
			</p>
			<button type="button" className="primary-action">
				Create Content
			</button>
			<p className="page-note">
				Create Content will open an overlay where users pick a content type.
			</p>
		</main>
	);
}

export default CreatorHomePage;

