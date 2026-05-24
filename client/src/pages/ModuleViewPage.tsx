import usePageMeta from '../hooks/usePageMeta';
import './basic-page.css';

function ModuleViewPage() {
	usePageMeta({
		title: 'Module View',
		description: 'Legacy module view route kept for compatibility with the expanded content viewing workflow.',
		path: '/module/view'
	});

	return (
		<main className="page-main basic-page">
			<h1>Module View Page</h1>
			<p>Compatibility route while Content Page remains the main viewer workflow.</p>
		</main>
	);
}

export default ModuleViewPage;

