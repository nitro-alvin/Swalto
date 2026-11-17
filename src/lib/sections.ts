import type { Item, SectionType } from '../types/resume'

export type FieldKind = 'text' | 'textarea' | 'url' | 'list'

export type FieldDef = {
  key: string
  label: string
  kind: FieldKind
  placeholder?: string
  hint?: string
  /** Render side by side on wide screens. */
  half?: boolean
}

export const SECTION_LABELS: Record<SectionType, string> = {
  summary: 'Professional Summary',
  education: 'Education',
  experience: 'Work Experience',
  skills: 'Skills',
  projects: 'Projects',
  internships: 'Internships',
  certifications: 'Certifications',
  languages: 'Languages',
  awards: 'Awards',
  volunteer: 'Volunteer Experience',
  custom: 'Custom Section',
}

export const SECTION_ICONS: Record<SectionType, string> = {
  summary: 'AlignLeft',
  education: 'GraduationCap',
  experience: 'Briefcase',
  skills: 'Sparkles',
  projects: 'FolderGit2',
  internships: 'Building2',
  certifications: 'BadgeCheck',
  languages: 'Languages',
  awards: 'Trophy',
  volunteer: 'HeartHandshake',
  custom: 'SquarePen',
}

export const SECTION_FIELDS: Record<SectionType, FieldDef[]> = {
  summary: [],
  education: [
    { key: 'institution', label: 'Institution', kind: 'text', placeholder: 'Indian Institute of Technology' },
    { key: 'degree', label: 'Degree', kind: 'text', placeholder: 'B.Tech' },
    { key: 'field', label: 'Field of study', kind: 'text', placeholder: 'Computer Science' },
    { key: 'start', label: 'Start date', kind: 'text', placeholder: 'Aug 2021', half: true },
    { key: 'end', label: 'End date', kind: 'text', placeholder: 'May 2025', half: true },
    { key: 'score', label: 'CGPA / percentage', kind: 'text', placeholder: '8.6 / 10' },
  ],
  experience: [
    { key: 'role', label: 'Job title', kind: 'text', placeholder: 'Frontend Developer' },
    { key: 'company', label: 'Company', kind: 'text', placeholder: 'Acme Corp' },
    { key: 'location', label: 'Location', kind: 'text', placeholder: 'Bengaluru, India' },
    { key: 'start', label: 'Start date', kind: 'text', placeholder: 'Jun 2023', half: true },
    { key: 'end', label: 'End date', kind: 'text', placeholder: 'Present', half: true },
    {
      key: 'responsibilities',
      label: 'Responsibilities',
      kind: 'list',
      placeholder: 'One responsibility per line',
      hint: 'One bullet per line. Start with an action verb.',
    },
    {
      key: 'achievements',
      label: 'Achievements',
      kind: 'list',
      placeholder: 'One achievement per line',
      hint: 'Add numbers where you can — they carry weight.',
    },
  ],
  skills: [
    { key: 'category', label: 'Category', kind: 'text', placeholder: 'Technical skills' },
    { key: 'items', label: 'Skills', kind: 'text', placeholder: 'React, TypeScript, Node.js, SQL' },
  ],
  projects: [
    { key: 'name', label: 'Project name', kind: 'text', placeholder: 'Swalto' },
    { key: 'tech', label: 'Technologies used', kind: 'text', placeholder: 'React, TypeScript, Tailwind CSS' },
    { key: 'link', label: 'Live project link', kind: 'url', placeholder: 'https://…', half: true },
    { key: 'repo', label: 'GitHub link', kind: 'url', placeholder: 'https://github.com/…', half: true },
    {
      key: 'description',
      label: 'Description',
      kind: 'list',
      placeholder: 'What you built, what problem it solved, what happened',
      hint: 'One bullet per line.',
    },
  ],
  internships: [
    { key: 'role', label: 'Role', kind: 'text', placeholder: 'Software Engineering Intern' },
    { key: 'company', label: 'Company', kind: 'text', placeholder: 'Acme Corp' },
    { key: 'start', label: 'Start date', kind: 'text', placeholder: 'May 2024', half: true },
    { key: 'end', label: 'End date', kind: 'text', placeholder: 'Jul 2024', half: true },
    { key: 'description', label: 'What you did', kind: 'list', placeholder: 'One bullet per line' },
  ],
  certifications: [
    { key: 'name', label: 'Certification', kind: 'text', placeholder: 'AWS Cloud Practitioner' },
    { key: 'issuer', label: 'Issuer', kind: 'text', placeholder: 'Amazon Web Services' },
    { key: 'year', label: 'Year', kind: 'text', placeholder: '2024', half: true },
    { key: 'link', label: 'Credential link', kind: 'url', placeholder: 'https://…', half: true },
  ],
  languages: [
    { key: 'name', label: 'Language', kind: 'text', placeholder: 'English', half: true },
    { key: 'level', label: 'Proficiency', kind: 'text', placeholder: 'Professional', half: true },
  ],
  awards: [
    { key: 'title', label: 'Award', kind: 'text', placeholder: 'Best Final Year Project' },
    { key: 'issuer', label: 'Awarded by', kind: 'text', placeholder: 'University' },
    { key: 'year', label: 'Year', kind: 'text', placeholder: '2024', half: true },
    { key: 'description', label: 'Details', kind: 'text', placeholder: 'Short context (optional)' },
  ],
  volunteer: [
    { key: 'role', label: 'Role', kind: 'text', placeholder: 'Teaching Volunteer' },
    { key: 'organization', label: 'Organisation', kind: 'text', placeholder: 'Vidya Foundation' },
    { key: 'start', label: 'Start date', kind: 'text', placeholder: 'Jan 2023', half: true },
    { key: 'end', label: 'End date', kind: 'text', placeholder: 'Present', half: true },
    { key: 'description', label: 'What you did', kind: 'list', placeholder: 'One bullet per line' },
  ],
  custom: [
    { key: 'name', label: 'Title', kind: 'text', placeholder: 'Leadership' },
    { key: 'subtitle', label: 'Subtitle', kind: 'text', placeholder: 'Student Council, XYZ College' },
    { key: 'meta', label: 'Date or location', kind: 'text', placeholder: '2023 — 2024', half: true },
    { key: 'description', label: 'Description', kind: 'list', placeholder: 'One bullet per line' },
  ],
}

export const ITEM_LABELS: Record<SectionType, string> = {
  summary: 'Summary',
  education: 'Education entry',
  experience: 'Experience',
  skills: 'Skill group',
  projects: 'Project',
  internships: 'Internship',
  certifications: 'Certification',
  languages: 'Language',
  awards: 'Award',
  volunteer: 'Volunteer role',
  custom: 'Entry',
}

/** Section types a user can add from the "Add section" menu, in menu order. */
export const ADDABLE_SECTIONS: SectionType[] = [
  'summary',
  'education',
  'experience',
  'skills',
  'projects',
  'internships',
  'certifications',
  'languages',
  'awards',
  'volunteer',
  'custom',
]

export function emptyItem(type: SectionType, id: string): Item {
  const item: Item = { id }
  for (const field of SECTION_FIELDS[type]) item[field.key] = ''
  return item
}

/** True when the item has at least one non-empty value. */
export function itemHasContent(item: Item): boolean {
  return Object.entries(item).some(([key, value]) => key !== 'id' && value.trim() !== '')
}
