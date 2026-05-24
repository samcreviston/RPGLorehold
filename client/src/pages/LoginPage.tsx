import usePageMeta from '../hooks/usePageMeta';
import './basic-page.css';

function LoginPage() {
	usePageMeta({
		title: 'Login',
		description: 'Sign in to RPGLorehold to manage campaigns, favorites, and created content.',
		path: '/login'
	});

	return (
		<main className="page-main basic-page">
			<h1>Login Page</h1>
			<p>Login form container for authentication and account access.</p>
		</main>
	);
}

export default LoginPage;

