import type { Design, Item, Personal, ResumeData, ResumeSection } from '../../types/resume'
import { cn, csv, splitBullets, stripProtocol } from '../../lib/utils'

export type TemplateProps = {
  data: ResumeData
  design: Design
}

export type EntryModel = {
  title: string
  subtitle: string
  meta: string
  extra: string
  bullets: string[]
  links: string[]
}

export type BodyStyle = {
  title: string
  subtitle: string
  meta: string
  text: string
  extra?: string
  links?: string
  subtitleRow?: string
  marker?: string
  chips?: boolean
  inlineSkills?: boolean
  /** Stack skill categories above their values — used inside narrow sidebars. */
  stackSkills?: boolean
}

function hasItemContent(section: ResumeSection): boolean {
  return section.items.some((item) =>
    Object.entries(item).some(([key, value]) => key !== 'id' && value.trim() !== ''),
  )
}

export function contentSections(data: ResumeData): ResumeSection[] {
  return data.sections.filter((section) => {
    if (!section.visible) return false
    if (section.type === 'summary') return data.summary.trim().length > 0
    return hasItemContent(section)
  })
}

export function contactParts(personal: Personal): string[] {
  return [
    personal.email,
    personal.phone,
    personal.location,
    stripProtocol(personal.linkedin),
    stripProtocol(personal.github),
    stripProtocol(personal.website),
  ]
    .map((value) => value.trim())
    .filter(Boolean)
}

const range = (start?: string, end?: string) =>
  [start?.trim(), end?.trim()].filter(Boolean).join(' — ')

export function entryFor(section: ResumeSection, item: Item): EntryModel {
  const value = (key: string) => (item[key] ?? '').trim()
  const empty: EntryModel = { title: '', subtitle: '', meta: '', extra: '', bullets: [], links: [] }

  switch (section.type) {
    case 'education': {
      const degree = [value('degree'), value('field') ? `in ${value('field')}` : '']
        .filter(Boolean)
        .join(' ')
      return {
        ...empty,
        title: degree,
        subtitle: value('institution'),
        meta: range(item.start, item.end),
        extra: value('score'),
      }
    }
    case 'experience':
      return {
        ...empty,
        title: value('role'),
        subtitle: [value('company'), value('location')].filter(Boolean).join(' · '),
        meta: range(item.start, item.end),
        bullets: [...splitBullets(item.responsibilities), ...splitBullets(item.achievements)],
      }
    case 'internships':
      return {
        ...empty,
        title: value('role'),
        subtitle: value('company'),
        meta: range(item.start, item.end),
        bullets: splitBullets(item.description),
      }
    case 'volunteer':
      return {
        ...empty,
        title: value('role'),
        subtitle: value('organization'),
        meta: range(item.start, item.end),
        bullets: splitBullets(item.description),
      }
    case 'projects':
      return {
        ...empty,
        title: value('name'),
        subtitle: value('tech'),
        bullets: splitBullets(item.description),
        links: [stripProtocol(item.link), stripProtocol(item.repo)].filter(Boolean),
      }
    case 'certifications':
      return {
        ...empty,
        title: value('name'),
        subtitle: value('issuer'),
        meta: value('year'),
        links: [stripProtocol(item.link)].filter(Boolean),
      }
    case 'awards':
      return {
        ...empty,
        title: value('title'),
        subtitle: value('issuer'),
        meta: value('year'),
        bullets: value('description') ? [value('description')] : [],
      }
    case 'languages':
      return {
        ...empty,
        title: value('name'),
        subtitle: '',
        meta: value('level'),
      }
    case 'custom':
      return {
        ...empty,
        title: value('name'),
        subtitle: value('subtitle'),
        meta: value('meta'),
        bullets: splitBullets(item.description),
      }
    default:
      return empty
  }
}

export function Bullets({
  items,
  className,
  marker = '•',
}: {
  items: string[]
  className?: string
  marker?: string
}) {
  if (!items.length) return null
  return (
    <ul className={cn('rf-bullets', className)}>
      {items.map((bullet, index) => (
        <li key={index}>
          <span className="rf-bullet-mark" aria-hidden>
            {marker}
          </span>
          <span className="min-w-0">{bullet}</span>
        </li>
      ))}
    </ul>
  )
}

export function SectionBody({
  section,
  data,
  style,
}: {
  section: ResumeSection
  data: ResumeData
  style: BodyStyle
}) {
  if (section.type === 'summary') {
    return <p className={cn(style.text, 'whitespace-pre-line')}>{data.summary.trim()}</p>
  }

  if (section.type === 'skills') {
    const groups = section.items
      .map((item) => ({
        category: (item.category ?? '').trim(),
        items: csv(item.items),
      }))
      .filter((group) => group.items.length > 0)
    if (!groups.length) return null

    if (style.inlineSkills) {
      return (
        <div className={cn('flex flex-col gap-[0.2em]', style.text)}>
          {groups.map((group, index) => (
            <p key={index}>
              {group.category && <span className={cn(style.title, 'mr-[0.35em]')}>{group.category}:</span>}
              <span>{group.items.join(' · ')}</span>
            </p>
          ))}
        </div>
      )
    }

    if (style.stackSkills) {
      return (
        <div className="flex flex-col gap-[0.35em]">
          {groups.map((group, index) => (
            <div key={index}>
              {group.category && <p className={cn(style.title, 'mb-[0.05em]')}>{group.category}</p>}
              <p className={style.text}>{group.items.join(', ')}</p>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-[0.25em]">
        {groups.map((group, index) => (
          <div key={index} className="flex gap-[0.6em]">
            {group.category && (
              <span className={cn(style.title, 'w-[8.5em] shrink-0')}>{group.category}</span>
            )}
            <span className={cn(style.text, 'min-w-0 flex-1')}>{group.items.join(', ')}</span>
          </div>
        ))}
      </div>
    )
  }

  if (section.type === 'languages') {
    const languages = section.items
      .map((item) => {
        const name = (item.name ?? '').trim()
        const level = (item.level ?? '').trim()
        if (!name) return ''
        return level ? `${name} (${level})` : name
      })
      .filter(Boolean)
    if (!languages.length) return null
    return <p className={style.text}>{languages.join('   ·   ')}</p>
  }

  return (
    <div>
      {section.items.map((item) => {
        const entry = entryFor(section, item)
        if (!entry.title && !entry.subtitle && !entry.bullets.length) return null
        return (
          <div key={item.id} className="rf-item rf-block">
            <div className="flex items-baseline justify-between gap-[1em]">
              {entry.title && <h3 className={style.title}>{entry.title}</h3>}
              {entry.meta && <span className={style.meta}>{entry.meta}</span>}
            </div>

            {section.type === 'projects' && style.chips && item.tech ? (
              <div className="mt-[0.25em] flex flex-wrap gap-[0.3em]">
                {csv(item.tech).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-[0.25em] px-[0.4em] py-[0.02em] text-[0.78em]"
                    style={{ background: 'rgba(15, 23, 42, 0.055)', color: '#3f4756' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              (entry.subtitle || entry.extra) && (
                <div className={cn('flex items-baseline justify-between gap-[1em]', style.subtitleRow)}>
                  {entry.subtitle && <span className={style.subtitle}>{entry.subtitle}</span>}
                  {entry.extra && <span className={style.extra ?? style.meta}>{entry.extra}</span>}
                </div>
              )
            )}

            {entry.links.length > 0 && <p className={style.links}>{entry.links.join('   ·   ')}</p>}
            <Bullets items={entry.bullets} className={style.text} marker={style.marker} />
          </div>
        )
      })}
    </div>
  )
}

/** Shared palette of body styles so each template stays visually distinct but consistent. */
export const BODY_STYLES = {
  modern: {
    title: 'text-[0.97em] font-semibold text-[#111318]',
    subtitle: 'text-[0.92em] text-[#374151]',
    subtitleRow: 'mt-[0.05em]',
    meta: 'shrink-0 text-[0.82em] text-[#6b7280] tabular-nums',
    extra: 'shrink-0 text-[0.82em] text-[#6b7280]',
    links: 'mt-[0.15em] text-[0.8em] text-[#4b5563]',
    text: 'text-[0.93em] leading-[1.5] text-[#232936]',
    marker: '•',
  },
  minimal: {
    title: 'text-[0.97em] font-bold text-black',
    subtitle: 'text-[0.93em] text-black',
    subtitleRow: 'mt-[0.05em]',
    meta: 'shrink-0 text-[0.88em] text-black tabular-nums',
    extra: 'shrink-0 text-[0.88em] text-black',
    links: 'mt-[0.1em] text-[0.86em] text-black',
    text: 'text-[0.93em] leading-[1.45] text-black',
    marker: '–',
  },
  classic: {
    title: 'text-[0.99em] font-bold text-[#17181c]',
    subtitle: 'text-[0.93em] italic text-[#2c2f36]',
    subtitleRow: 'mt-[0.05em]',
    meta: 'shrink-0 text-[0.86em] italic text-[#3b3f47] tabular-nums',
    extra: 'shrink-0 text-[0.86em] italic text-[#3b3f47]',
    links: 'mt-[0.1em] text-[0.84em] text-[#3b3f47]',
    text: 'text-[0.95em] leading-[1.5] text-[#1b1d22]',
    marker: '•',
  },
  student: {
    title: 'text-[0.97em] font-semibold text-[#111318]',
    subtitle: 'text-[0.92em] font-medium text-[#3d4b4a]',
    subtitleRow: 'mt-[0.05em]',
    meta: 'shrink-0 text-[0.82em] font-medium text-[#0f766e] tabular-nums',
    extra: 'shrink-0 text-[0.82em] font-medium text-[#0f766e]',
    links: 'mt-[0.15em] text-[0.8em] text-[#0f766e]',
    text: 'text-[0.93em] leading-[1.5] text-[#22302f]',
    marker: '▸',
    chips: true,
  },
  developer: {
    title: 'text-[0.97em] font-semibold text-[#0f1218]',
    subtitle: 'text-[0.88em] text-[#3f4652]',
    subtitleRow: 'mt-[0.05em]',
    meta: 'shrink-0 font-mono text-[0.8em] text-[#5b6472] tabular-nums',
    extra: 'shrink-0 font-mono text-[0.8em] text-[#5b6472]',
    links: 'mt-[0.15em] font-mono text-[0.78em] text-[#3b4a63]',
    text: 'text-[0.92em] leading-[1.5] text-[#1d2330]',
    marker: '›',
  },
} satisfies Record<string, BodyStyle>
