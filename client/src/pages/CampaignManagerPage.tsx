import usePageMeta from '../hooks/usePageMeta';
import './basic-page.css';

function CampaignManagerPage() {
	usePageMeta({
		title: 'Campaign Manager',
		description: 'Organize campaign modules, notes, and session planning in one management workspace.',
		path: '/campaigns'
	});

	return (
		<main className="page-main basic-page">
			<h1>Campaign Manager Page</h1>
			<p>Campaign management page for module organization and session workflows.</p>
		</main>
	);
}

export default CampaignManagerPage;

