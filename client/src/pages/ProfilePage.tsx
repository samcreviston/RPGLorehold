import usePageMeta from '../hooks/usePageMeta';
import './basic-page.css';

function ProfilePage() {
	usePageMeta({
		title: 'Profile',
		description: 'View and manage your RPGLorehold account profile and preferences.',
		path: '/profile'
	});

	return (
		<main className="page-main basic-page">
			<h1>Profile Page</h1>
			<p>Profile details page for account information and milestone progress.</p>
		</main>
	);
}

export default ProfilePage;

