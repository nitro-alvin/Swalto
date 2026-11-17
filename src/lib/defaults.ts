import type {
  Design,
  ResumeData,
  ResumeRecord,
  ResumeSection,
  SectionType,
  TemplateId,
} from '../types/resume'
import { emptyItem, SECTION_LABELS } from './sections'
import { nowIso, uid } from './utils'

export const FONT_STACKS: Record<Design['fontFamily'], string> = {
  inter: '"Inter", "Helvetica Neue", Arial, sans-serif',
  serif: '"Source Serif 4", Georgia, "Times New Roman", serif',
  georgia: 'Georgia, "Times New Roman", serif',
  arial: 'Arial, "Helvetica Neue", sans-serif',
  times: '"Times New Roman", Times, serif',
  mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace',
}

export const FONT_LABELS: Record<Design['fontFamily'], string> = {
  inter: 'Inter — modern sans',
  serif: 'Source Serif — editorial',
  georgia: 'Georgia — readable serif',
  arial: 'Arial — classic sans',
  times: 'Times New Roman — traditional',
  mono: 'IBM Plex Mono — technical',
}

export type TemplateMeta = {
  id: TemplateId
  name: string
  tagline: string
  description: string
  columns: 'Single column' | 'Single or two column'
  tone: 'Professional' | 'Minimal' | 'Classic' | 'Friendly' | 'Technical'
  defaultAccent: string
  defaultFont: Design['fontFamily']
  bestFor: string
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    tagline: 'Clean hierarchy with a confident accent',
    description:
      'A crisp single-column layout with a strong name block and accent section rules. The optional sidebar moves skills and languages out of the main reading flow.',
    columns: 'Single or two column',
    tone: 'Professional',
    defaultAccent: '#4f46e5',
    defaultFont: 'inter',
    bestFor: 'Experienced professionals and job seekers who want a polished, current look.',
  },
  {
    id: 'minimal-ats',
    name: 'Minimal ATS',
    tagline: 'Plain text structure, nothing to misread',
    description:
      'No colour, no columns, no graphics — just the headings, dates and bullets that parsers and recruiters expect. The safest choice for large application portals.',
    columns: 'Single column',
    tone: 'Minimal',
    defaultAccent: '#111827',
    defaultFont: 'arial',
    bestFor: 'Anyone applying through an ATS-heavy process or a company careers portal.',
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    tagline: 'Timeless serif resume',
    description:
      'A centred header, letter-spaced section headings and right-aligned dates. Formal and familiar for academia, finance, consulting and public sector roles.',
    columns: 'Single column',
    tone: 'Classic',
    defaultAccent: '#1f2937',
    defaultFont: 'georgia',
    bestFor: 'Formal industries, senior roles and academic applications.',
  },
  {
    id: 'student',
    name: 'Student / Fresher',
    tagline: 'Built around education and projects',
    description:
      'A friendly layout that puts your degree, coursework and projects forward so a resume with no full-time experience still feels complete.',
    columns: 'Single column',
    tone: 'Friendly',
    defaultAccent: '#0d9488',
    defaultFont: 'inter',
    bestFor: 'College students, freshers and recent graduates.',
  },
  {
    id: 'developer',
    name: 'Software Developer',
    tagline: 'Projects, stack and impact first',
    description:
      'Monospace accents, compact skill groups and project blocks with their stack called out. Designed for engineering resumes that need to read as technical.',
    columns: 'Single or two column',
    tone: 'Technical',
    defaultAccent: '#2563eb',
    defaultFont: 'inter',
    bestFor: 'Developers, engineers and technical interns.',
  },
]

export const DEFAULT_ACCENTS = ['#111827', '#4f46e5', '#2563eb', '#0d9488', '#b45309', '#be123c', '#7c3aed']

export function defaultDesign(template: TemplateId = 'modern'): Design {
  const meta = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0]
  return {
    template: meta.id,
    fontFamily: meta.defaultFont,
    fontSize: 10.5,
    accent: meta.defaultAccent,
    spacing: 1,
    layout: 'single',
  }
}

let sectionCounter = 0

export function makeSection(type: SectionType, items = 1, title?: string): ResumeSection {
  sectionCounter += 1
  return {
    id: uid(`sec${sectionCounter}`),
    type,
    title: title ?? SECTION_LABELS[type],
    visible: true,
    items: Array.from({ length: items }, (_, index) => emptyItem(type, uid(`item${index}`))),
  }
}

export function starterData(): ResumeData {
  return {
    personal: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
    summary: '',
    sections: [
      makeSection('summary', 0),
      makeSection('education', 1),
      makeSection('skills', 2),
      makeSection('projects', 1),
      makeSection('experience', 1),
      makeSection('certifications', 1),
      makeSection('languages', 1),
    ].map((section) => {
      // Sensible starting values for skill groups without inventing skills.
      if (section.type === 'skills') {
        section.items[0].category = 'Technical skills'
        section.items[1].category = 'Soft skills'
      }
      return section
    }),
  }
}

export function createResumeRecord(name = 'Untitled resume', template: TemplateId = 'modern'): ResumeRecord {
  const timestamp = nowIso()
  return {
    id: uid('resume'),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    data: starterData(),
    design: defaultDesign(template),
  }
}

/** Data used for marketing previews and the template gallery. */
export function sampleData(): ResumeData {
  return {
    personal: {
      fullName: 'Ananya Sharma',
      title: 'Frontend Developer',
      email: 'ananya.sharma@example.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      linkedin: 'linkedin.com/in/ananyasharma',
      github: 'github.com/ananyasharma',
      website: 'ananya.dev',
    },
    summary:
      'Frontend developer with 3 years of experience building accessible, performant web applications in React and TypeScript. Shipped design-system work used across 12 product teams and cut page load time by 38% on the flagship dashboard.',
    sections: [
      {
        id: 's_exp',
        type: 'experience',
        title: 'Work Experience',
        visible: true,
        items: [
          {
            id: 'e1',
            role: 'Frontend Developer',
            company: 'Northwind Labs',
            location: 'Bengaluru, India',
            start: 'Jun 2023',
            end: 'Present',
            responsibilities:
              'Build and maintain the customer dashboard in React, TypeScript and Tailwind CSS\nPartner with design to ship a shared component library across 12 product teams',
            achievements:
              'Reduced first contentful paint by 38% by code-splitting routes and deferring analytics\nRaised Lighthouse accessibility score from 78 to 98',
          },
          {
            id: 'e2',
            role: 'Junior Web Developer',
            company: 'Bluepeak Studio',
            location: 'Remote',
            start: 'Jul 2022',
            end: 'May 2023',
            responsibilities:
              'Delivered 9 client marketing sites from Figma to production\nAdded automated visual regression checks for the shared template system',
            achievements: 'Cut average build time from 6 minutes to 90 seconds',
          },
        ],
      },
      {
        id: 's_edu',
        type: 'education',
        title: 'Education',
        visible: true,
        items: [
          {
            id: 'ed1',
            institution: 'Visvesvaraya Technological University',
            degree: 'B.E.',
            field: 'Computer Science and Engineering',
            start: 'Aug 2018',
            end: 'Jun 2022',
            score: '8.7 / 10 CGPA',
          },
        ],
      },
      {
        id: 's_proj',
        type: 'projects',
        title: 'Projects',
        visible: true,
        items: [
          {
            id: 'p1',
            name: 'Swalto',
            tech: 'React, TypeScript, Tailwind CSS',
            link: 'swalto.app',
            repo: 'github.com/ananyasharma/swalto',
            description:
              'Built a resume builder with live A4 preview, five templates and instant PDF export\nImplemented a rule-based ATS checker that scores keyword coverage against a job description',
          },
        ],
      },
      {
        id: 's_skills',
        type: 'skills',
        title: 'Skills',
        visible: true,
        items: [
          { id: 'sk1', category: 'Technical', items: 'React, TypeScript, Next.js, Tailwind CSS, Node.js, Playwright' },
          { id: 'sk2', category: 'Soft skills', items: 'Mentoring, written communication, cross-team collaboration' },
        ],
      },
      {
        id: 's_cert',
        type: 'certifications',
        title: 'Certifications',
        visible: true,
        items: [
          { id: 'c1', name: 'Meta Front-End Developer', issuer: 'Coursera', year: '2023', link: '' },
        ],
      },
      {
        id: 's_lang',
        type: 'languages',
        title: 'Languages',
        visible: true,
        items: [
          { id: 'l1', name: 'English', level: 'Professional' },
          { id: 'l2', name: 'Hindi', level: 'Native' },
        ],
      },
    ],
  }
}

export function sampleResume(template: TemplateId = 'modern'): ResumeRecord {
  const timestamp = nowIso()
  return {
    id: uid('sample'),
    name: 'Sample resume',
    createdAt: timestamp,
    updatedAt: timestamp,
    data: sampleData(),
    design: defaultDesign(template),
  }
}
