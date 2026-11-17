import type { TemplateId } from '../types/resume'
import { TEMPLATES } from './defaults'

export function getTemplateMeta(id: TemplateId) {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0]
}
