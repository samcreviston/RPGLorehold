import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { createTemplateMap } from '../templates/create';
import { templateTypeOptions, type TemplateTypeKey } from '../templates/templateTypes';
import './creator-page.css';

function CreatorPage() {
	const [searchParams] = useSearchParams();
	const moduleIdFromQuery = searchParams.get('moduleId')?.trim() ?? '';
	const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateTypeKey>('module');

	usePageMeta({
		title: 'Creator',
		description: 'Build RPG content using dedicated templates for modules, campaigns, creatures, and items.',
		path: '/creator'
	});

	const SelectedTemplate = useMemo(
		() => createTemplateMap[selectedTemplateType],
		[selectedTemplateType]
	);

	return (
		<main className="page-main creator-page">
			<h1>Creator Page</h1>
			<p>
				The content creation page will load a type-specific template. Use this selector to preview
				starter layouts for each content type.
			</p>
			<label htmlFor="creator-template-select">Create template type</label>
			<select
				id="creator-template-select"
				value={selectedTemplateType}
				onChange={(event) => setSelectedTemplateType(event.target.value as TemplateTypeKey)}
			>
				{templateTypeOptions.map((templateTypeOption) => (
					<option key={templateTypeOption.key} value={templateTypeOption.key}>
						{templateTypeOption.label}
					</option>
				))}
			</select>
			<SelectedTemplate key={moduleIdFromQuery || 'new-module'} />
		</main>
	);
}

export default CreatorPage;
