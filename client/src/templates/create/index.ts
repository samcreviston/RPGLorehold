import { createElement, type ComponentType } from 'react';
import BaseCreateTemplate from './BaseCreateTemplate';
import { templateTypeLabelMap, type TemplateTypeKey } from '../templateTypes';

export const createTemplateMap: Record<TemplateTypeKey, ComponentType> = Object.fromEntries(
	Object.entries(templateTypeLabelMap).map(([templateTypeKey, templateTypeLabel]) => [
		templateTypeKey,
		() => createElement(BaseCreateTemplate, { templateName: templateTypeLabel })
	])
) as unknown as Record<TemplateTypeKey, ComponentType>;
