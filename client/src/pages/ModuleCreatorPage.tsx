import usePageMeta from '../hooks/usePageMeta';
import './basic-page.css';

function ModuleCreatorPage() {
	usePageMeta({
		title: 'Module Creator',
		description: 'Legacy module creator route kept for compatibility with the expanded creator workflow.',
		path: '/module/creator'
	});

	return (
		<main className="page-main basic-page">
			<h1>Module Creator Page</h1>
			<p>Compatibility route while Creator Page remains the primary workflow entry point.</p>
		</main>
	);
}

export default ModuleCreatorPage;

