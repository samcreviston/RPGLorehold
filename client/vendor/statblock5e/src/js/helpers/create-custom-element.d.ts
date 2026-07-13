export function createCustomElement(
	name: string,
	contentNode: DocumentFragment,
	elementClass?: ((contentNode: DocumentFragment) => CustomElementConstructor) | null
): void;
