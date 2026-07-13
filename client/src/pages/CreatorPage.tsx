import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { createTemplateMap } from '../templates/create';
import ModuleCreateTemplate from '../templates/create/ModuleCreateTemplate';
import { templateTypeOptions, type TemplateTypeKey } from '../templates/templateTypes';
import './creator-page.css';

type CreatorViewMode = 'editor' | 'preview';

function CreatorPage() {
	const [searchParams] = useSearchParams();
	const moduleIdFromQuery = searchParams.get('moduleId')?.trim() ?? '';
	const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateTypeKey>('module');
	const [viewMode, setViewMode] = useState<CreatorViewMode>('editor');

	usePageMeta({
		title: 'Creator',
		description: 'Build RPG content using dedicated templates for modules, campaigns, creatures, and items.',
		path: '/creator'
	});

	const SelectedTemplate = useMemo(
		() => createTemplateMap[selectedTemplateType],
		[selectedTemplateType]
	);

	const moduleTemplateKey = moduleIdFromQuery || 'new-module';

	return (
		<main className="page-main creator-page">
			<div className="creator-mode-tabs" role="tablist" aria-label="Creator view mode">
				<button
					type="button"
					role="tab"
					id="creator-tab-editor"
					aria-selected={viewMode === 'editor'}
					aria-controls="creator-tab-panel"
					className={`creator-mode-tab${viewMode === 'editor' ? ' creator-mode-tab--active' : ''}`}
					onClick={() => setViewMode('editor')}
				>
					Editor
				</button>
				<button
					type="button"
					role="tab"
					id="creator-tab-preview"
					aria-selected={viewMode === 'preview'}
					aria-controls="creator-tab-panel"
					className={`creator-mode-tab${viewMode === 'preview' ? ' creator-mode-tab--active' : ''}`}
					onClick={() => setViewMode('preview')}
				>
					Preview
				</button>
			</div>

			<div id="creator-tab-panel" role="tabpanel" aria-labelledby={`creator-tab-${viewMode}`}>
				{viewMode === 'editor' ? (
					<>
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
					</>
				) : null}

				{selectedTemplateType === 'module' ? (
					<ModuleCreateTemplate key={moduleTemplateKey} viewMode={viewMode} />
				) : viewMode === 'editor' ? (
					<SelectedTemplate key={moduleTemplateKey} />
				) : (
					<p className="creator-preview-empty">
						begin writing your content in the editor tab and then preview it here
					</p>
				)}
			</div>
		</main>
	);
}

export default CreatorPage;
