import usePageMeta from '../hooks/usePageMeta';
import './user-page.css';

function UserPage() {
	usePageMeta({
		title: 'User',
		description: 'Manage profile details, favorites, saved campaigns, and account preferences.',
		path: '/user'
	});

	return (
		<main className="page-main user-page">
			<h1>User Page</h1>
			<p>Favorites, profile details, saved campaigns, and account preferences.</p>
		</main>
	);
}

export default UserPage;

