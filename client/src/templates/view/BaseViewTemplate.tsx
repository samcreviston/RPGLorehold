type BaseViewTemplateProps = {
	templateName: string;
};

function BaseViewTemplate({ templateName }: BaseViewTemplateProps) {
	return (
		<section className="template-card" aria-label={`${templateName} view template`}>
			<h2>{templateName} View Template</h2>
			<p>Starter structure, panels, and read-only presentation for {templateName} content.</p>
		</section>
	);
}

export default BaseViewTemplate;

