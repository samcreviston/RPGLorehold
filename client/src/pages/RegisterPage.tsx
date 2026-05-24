import usePageMeta from '../hooks/usePageMeta';
import './basic-page.css';

function RegisterPage() {
	usePageMeta({
		title: 'Register',
		description: 'Create an RPGLorehold account to save content, manage campaigns, and build modules.',
		path: '/register'
	});

	return (
		<main className="page-main basic-page">
			<h1>Register Page</h1>
			<p>Registration form container for new account creation.</p>
		</main>
	);
}

export default RegisterPage;

