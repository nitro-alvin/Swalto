import type { ResumeData } from '../types/resume'
import { suggestedKeywords } from './ats'
import { csv, splitBullets } from './utils'

/**
 * AI extension point.
 *
 * The app ships with a local, deterministic provider so the product works with no API key and no
 * running cost. A hosted AI provider can be added later by implementing `AiProvider` and pointing
 * `VITE_AI_ENDPOINT` at your own server route. That route — never the browser — must hold the model
 * key, and it must be instructed to only rewrite facts the user supplied. Nothing here invents
 * employers, degrees, dates, metrics or skills.
 */
export type SummaryInput = { data: ResumeData }

export type AiProvider = {
  id: string
  label: string
  /** False when the provider needs configuration the user has not supplied yet. */
  available: boolean
  generateSummary(input: SummaryInput): Promise<string>
  improveBullet(bullet: string): Promise<string>
  suggestKeywords(jobDescription: string, data: ResumeData): Promise<string[]>
}

function topSkills(data: ResumeData, limit = 6): string[] {
  const section = data.sections.find((candidate) => candidate.type === 'skills' && candidate.visible)
  if (!section) return []
  const groups = section.items
    .map((item) => ({ category: item.category ?? '', items: csv(item.items) }))
    .filter((group) => group.items.length > 0)
  const primary = groups.find((group) => /tech|program|tool|language|framework/i.test(group.category)) ?? groups[0]
  return (primary?.items ?? []).slice(0, limit)
}

/** "Node.js, Express and PostgreSQL" */
function listPhrase(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * Builds a summary strictly from what the user typed. If there is not enough material it returns
 * an empty string so the UI can explain what is missing instead of inventing a career.
 */
function composeSummary(data: ResumeData): string {
  const { personal } = data
  const skills = topSkills(data)
  const education = data.sections.find((section) => section.type === 'education' && section.visible)?.items[0]
  const projectsSection = data.sections.find((section) => section.type === 'projects' && section.visible)
  const projectNames = (projectsSection?.items ?? [])
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name))
  const roles = data.sections
    .filter((section) => (section.type === 'experience' || section.type === 'internships') && section.visible)
    .flatMap((section) => section.items.map((item) => item.role?.trim()))
    .filter((role): role is string => Boolean(role))

  const facts: string[] = []
  const roleLabel = personal.title.trim() || roles[0] || ''
  if (roleLabel) {
    facts.push(`${roleLabel}${skills.length ? ` with hands-on experience in ${listPhrase(skills)}` : ''}.`)
  } else if (skills.length) {
    facts.push(`Works with ${listPhrase(skills)}.`)
  }
  if (education?.degree || education?.institution) {
    const degree = [education?.degree, education?.field].filter(Boolean).join(' in ')
    const institution = education?.institution?.trim()
    if (degree && institution) facts.push(`Holds a ${degree} from ${institution}.`)
    else if (degree) facts.push(`Holds a ${degree}.`)
    else if (institution) facts.push(`Studied at ${institution}.`)
  }
  if (projectsSection && projectNames.length) {
    const shown = projectNames.slice(0, 2)
    facts.push(`Built ${listPhrase(shown)}${projectNames.length > 2 ? ' and more' : ''}.`)
  }
  if (facts.length < 2) return ''
  const focus = personal.title.trim() ? `Now looking for a ${personal.title.trim()} role` : 'Now looking for a role'
  return `${facts.join(' ')} ${focus} where the work is measured by its impact.`
}

export const localProvider: AiProvider = {
  id: 'local',
  label: 'Local writing assistant',
  available: true,
  async generateSummary({ data }) {
    return composeSummary(data)
  },
  async improveBullet(bullet) {
    // Conservative cleanup only: no new claims, no invented metrics.
    const cleaned = bullet.trim().replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1')
    if (!cleaned) return ''
    const capitalised = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    return capitalised.endsWith('.') ? capitalised : `${capitalised}.`
  },
  async suggestKeywords(jobDescription, data) {
    return suggestedKeywords(jobDescription, data)
  },
}

/**
 * Returns the configured provider. A remote provider is only used when an endpoint is configured;
 * otherwise the local provider keeps every feature free and offline.
 */
export function getAiProvider(): AiProvider {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined
  if (!endpoint) return localProvider
  return {
    ...localProvider,
    id: 'remote',
    label: 'AI assistant',
    async generateSummary({ data }) {
      try {
        const response = await fetch(`${endpoint.replace(/\/$/, '')}/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume: data }),
        })
        if (!response.ok) throw new Error(`AI request failed (${response.status})`)
        const payload = (await response.json()) as { summary?: string }
        return payload.summary?.trim() || localProvider.generateSummary({ data })
      } catch {
        // Never fail the editor because a remote helper is unavailable.
        return localProvider.generateSummary({ data })
      }
    },
  }
}

/** Facts available for summarisation, used to explain why generation is unavailable. */
export function summaryMaterial(data: ResumeData): number {
  const hasRole = Boolean(data.personal.title.trim())
  const hasSkills = topSkills(data).length > 0
  const hasEducation = Boolean(
    data.sections
      .find((section) => section.type === 'education')
      ?.items.some((item) => item.institution || item.degree),
  )
  const hasProjects = Boolean(
    data.sections.find((section) => section.type === 'projects')?.items.some((item) => item.name),
  )
  return [hasRole, hasSkills, hasEducation, hasProjects].filter(Boolean).length
}

/** Bullets in the resume that could be tightened (long or missing a leading verb is out of scope). */
export function longBullets(data: ResumeData): string[] {
  return data.sections
    .filter((section) => section.visible)
    .flatMap((section) =>
      section.items.flatMap((item) => [...splitBullets(item.responsibilities), ...splitBullets(item.description)]),
    )
    .filter((bullet) => bullet.split(/\s+/).length > 40)
}
