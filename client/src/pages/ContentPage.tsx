import { useMemo, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { templateTypeOptions, type TemplateTypeKey } from '../templates/templateTypes';
import { viewTemplateMap } from '../templates/view';
import './content-page.css';

function ContentPage() {
	const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateTypeKey>('module');
	usePageMeta({
		title: 'Content',
		description: 'View RPG content templates by type, including modules, campaigns, creatures, and items.',
		path: '/content'
	});

	const SelectedTemplate = useMemo(
		() => viewTemplateMap[selectedTemplateType],
		[selectedTemplateType]
	);

	return (
		<main className="page-main content-page">
			<h1>Content Page</h1>
			<p>
				This page will load content-type specific viewing templates. Switch the type below to preview
				all starter view templates.
			</p>
			<label htmlFor="content-template-select">View template type</label>
			<select
				id="content-template-select"
				value={selectedTemplateType}
				onChange={(event) => setSelectedTemplateType(event.target.value as TemplateTypeKey)}
			>
				{templateTypeOptions.map((templateTypeOption) => (
					<option key={templateTypeOption.key} value={templateTypeOption.key}>
						{templateTypeOption.label}
					</option>
				))}
			</select>
			<SelectedTemplate />
		</main>
	);
}

export default ContentPage;

