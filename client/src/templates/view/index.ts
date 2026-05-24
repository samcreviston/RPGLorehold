import { createElement, type ComponentType } from 'react';
import BaseViewTemplate from './BaseViewTemplate';
import { templateTypeLabelMap, type TemplateTypeKey } from '../templateTypes';

export const viewTemplateMap: Record<TemplateTypeKey, ComponentType> = Object.fromEntries(
	Object.entries(templateTypeLabelMap).map(([templateTypeKey, templateTypeLabel]) => [
		templateTypeKey,
		() => createElement(BaseViewTemplate, { templateName: templateTypeLabel })
	])
) as unknown as Record<TemplateTypeKey, ComponentType>;
