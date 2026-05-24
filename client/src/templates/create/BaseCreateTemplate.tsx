type BaseCreateTemplateProps = {
	templateName: string;
};

function BaseCreateTemplate({ templateName }: BaseCreateTemplateProps) {
	return (
		<section className="template-card" aria-label={`${templateName} create template`}>
			<h2>{templateName} Create Template</h2>
			<p>Starter fields, structure blocks, and layout for creating {templateName} content.</p>
		</section>
	);
}

export default BaseCreateTemplate;

