export type SectionType =
  | 'summary'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'internships'
  | 'certifications'
  | 'languages'
  | 'awards'
  | 'volunteer'
  | 'custom'

/** Free-form field bag. Known keys are described by the section schema. */
export type Item = {
  id: string
  [key: string]: string
}

export type ResumeSection = {
  id: string
  type: SectionType
  title: string
  visible: boolean
  items: Item[]
}

export type Personal = {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  website: string
}

export type ResumeData = {
  personal: Personal
  /** Professional summary lives outside the section list but can be reordered as a section. */
  summary: string
  sections: ResumeSection[]
}

export type TemplateId = 'modern' | 'minimal-ats' | 'classic' | 'student' | 'developer'

export type FontKey = 'inter' | 'serif' | 'georgia' | 'arial' | 'times' | 'mono'

export type LayoutMode = 'single' | 'two-column'

export type Design = {
  template: TemplateId
  fontFamily: FontKey
  /** Base body size in px (resume canvas units). */
  fontSize: number
  accent: string
  /** Vertical rhythm multiplier, 0.8 – 1.4. */
  spacing: number
  layout: LayoutMode
}

export type ResumeRecord = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: ResumeData
  design: Design
}

export type ExportBundle = {
  app: 'swalto'
  version: 1
  exportedAt: string
  resumes: ResumeRecord[]
}
