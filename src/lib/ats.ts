import type { ResumeData, ResumeSection } from '../types/resume'
import { SECTION_LABELS } from './sections'
import { csv, splitBullets, words } from './utils'

export type CheckStatus = 'pass' | 'warn' | 'fail'

export type AtsCheck = {
  id: string
  label: string
  status: CheckStatus
  detail: string
  suggestion?: string
  /** Points this check is worth inside the 100 point scale. */
  weight: number
}

export type KeywordMatch = {
  term: string
  inResume: boolean
  /** How often it appears in the job description. */
  jobMentions: number
}

export type AtsReport = {
  score: number
  grade: 'Strong' | 'Good' | 'Needs work' | 'Incomplete'
  checks: AtsCheck[]
  keywords: {
    used: boolean
    matches: KeywordMatch[]
    coverage: number
  }
  stats: {
    wordCount: number
    bulletCount: number
    averageBulletWords: number
    resumeKeywords: number
  }
  suggestions: string[]
}

const STOPWORDS = new Set(
  `a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves
  work working works role roles job position candidate candidates company team teams year years experience experienced ability able apply application applicants responsibilities responsibility requirements required require preferred plus nice must strong good great excellent new using use used help support include including includes etc across within also may might must will shall via per`
    .split(/\s+/)
    .filter(Boolean),
)

const SYNONYMS: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'node.js',
  node: 'node.js',
  postgres: 'postgresql',
  k8s: 'kubernetes',
  golang: 'go',
  html5: 'html',
  css3: 'css',
  ml: 'machine learning',
  ai: 'artificial intelligence',
  ui: 'ui',
  ux: 'ux',
  qa: 'quality assurance',
}

/** Tokens of 2 characters we still care about (C, R, Go, C# …). */
const SHORT_TOKENS = new Set(['c', 'r', 'go', 'c#', 'c++', 'js', 'ts', 'ml', 'ai', 'ui', 'ux', 'qa', 'ci', 'cd'])

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9+#.]*/g) ?? [])
    .map((token) => token.replace(/\.$/, ''))
    .filter((token) => token.length > 2 || SHORT_TOKENS.has(token))
}

function canonical(token: string): string {
  return SYNONYMS[token] ?? token
}

/** Loose singular form so "API" and "APIs" compare equal. Never used for display text. */
function stem(token: string): string {
  if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1)
  return token
}

export function resumePlainText(data: ResumeData): string {
  const parts: string[] = [
    data.personal.fullName,
    data.personal.title,
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.github,
    data.personal.website,
    data.summary,
  ]
  for (const section of data.sections) {
    if (!section.visible) continue
    parts.push(section.title)
    for (const item of section.items) {
      for (const [key, value] of Object.entries(item)) {
        if (key !== 'id') parts.push(value)
      }
    }
  }
  return parts.filter(Boolean).join('\n')
}

function visibleSections(data: ResumeData): ResumeSection[] {
  return data.sections.filter((section) => section.visible && section.type !== 'summary')
}

function sectionHasContent(section: ResumeSection): boolean {
  return section.items.some((item) =>
    Object.entries(item).some(([key, value]) => key !== 'id' && value.trim() !== ''),
  )
}

function allBullets(data: ResumeData): string[] {
  const bullets: string[] = []
  for (const section of visibleSections(data)) {
    for (const item of section.items) {
      for (const key of ['responsibilities', 'achievements', 'description']) {
        bullets.push(...splitBullets(item[key]))
      }
    }
  }
  return bullets
}

function check(
  id: string,
  label: string,
  weight: number,
  passed: boolean,
  detail: string,
  suggestion?: string,
  warnInstead?: boolean,
): AtsCheck {
  return {
    id,
    label,
    weight,
    status: passed ? 'pass' : warnInstead ? 'warn' : 'fail',
    detail,
    suggestion: passed ? undefined : suggestion,
  }
}

type JobKeyword = { term: string; key: string; count: number }

function extractJobKeywords(jobDescription: string): JobKeyword[] {
  const counts = new Map<string, { term: string; count: number }>()
  const bump = (key: string, term: string) => {
    const existing = counts.get(key)
    if (existing) existing.count += 1
    else counts.set(key, { term, count: 1 })
  }

  const tokens = tokenize(jobDescription).map(canonical).filter((token) => !STOPWORDS.has(token))
  for (const token of tokens) bump(stem(token), token)

  // Phrases (two adjacent meaningful words, separated by a space) that appear more than once are
  // usually requirements. Matching on a literal space keeps phrases from crossing punctuation.
  const pairs = jobDescription.toLowerCase().match(/[a-z0-9][a-z0-9+#.]* [a-z0-9][a-z0-9+#.]*/g) ?? []
  for (const pair of pairs) {
    const [rawFirst, rawSecond] = pair.split(' ').map((word) => canonical(word.replace(/\.$/, '')))
    if (rawFirst.length < 3 || rawSecond.length < 3) continue
    if (STOPWORDS.has(rawFirst) || STOPWORDS.has(rawSecond)) continue
    bump(`${stem(rawFirst)} ${stem(rawSecond)}`, `${rawFirst} ${rawSecond}`)
  }

  return [...counts.entries()]
    .filter(([key, entry]) => entry.count > 1 || key.includes(' ') || key.length > 3)
    .map(([key, entry]) => ({ key, term: entry.term, count: entry.count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, 30)
}

const STANDARD_HEADINGS: Record<string, string[]> = {
  education: ['education', 'academic', 'qualification'],
  experience: ['experience', 'employment', 'work history'],
  skills: ['skills', 'technologies', 'competencies', 'technical'],
  projects: ['projects', 'portfolio'],
  internships: ['internship', 'intern'],
  certifications: ['certification', 'certificate', 'licence', 'license'],
  languages: ['language'],
  awards: ['award', 'honour', 'honor', 'achievement'],
  volunteer: ['volunteer', 'community'],
}

export function analyzeResume(data: ResumeData, jobDescription = ''): AtsReport {
  const checks: AtsCheck[] = []
  const text = resumePlainText(data)
  const plain = text.toLowerCase()
  const bullets = allBullets(data)
  const wordCount = words(text)
  const sections = visibleSections(data).filter(sectionHasContent)
  const summaryWords = words(data.summary)
  const averageBulletWords = bullets.length
    ? Math.round(bullets.reduce((total, bullet) => total + words(bullet), 0) / bullets.length)
    : 0

  // ---- Contact information (20) ----
  checks.push(
    check(
      'name',
      'Full name',
      4,
      data.personal.fullName.trim().length > 1,
      data.personal.fullName.trim() ? `Name present: ${data.personal.fullName.trim()}` : 'No full name found.',
      'Add your full name at the top so parsers can identify you.',
    ),
  )
  checks.push(
    check(
      'email',
      'Email address',
      4,
      /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(data.personal.email.trim()),
      data.personal.email.trim() ? `Email present: ${data.personal.email.trim()}` : 'No email address found.',
      'Add a professional email address in the contact block.',
    ),
  )
  checks.push(
    check(
      'phone',
      'Phone number',
      4,
      data.personal.phone.replace(/\D/g, '').length >= 7,
      data.personal.phone.trim() ? 'Phone number present.' : 'No phone number found.',
      'Add a phone number with the country code.',
    ),
  )
  checks.push(
    check(
      'location',
      'Location',
      4,
      data.personal.location.trim().length > 1,
      data.personal.location.trim() ? `Location: ${data.personal.location.trim()}` : 'No location found.',
      'Add a city and country — many ATS filters use location.',
    ),
  )
  const links = [data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean)
  checks.push(
    check(
      'links',
      'Professional links',
      4,
      links.length > 0,
      links.length ? `${links.length} link${links.length > 1 ? 's' : ''} present.` : 'No LinkedIn, GitHub or portfolio link.',
      'Add at least one link (LinkedIn, GitHub or portfolio) as plain text.',
      true,
    ),
  )

  // ---- Structure and headings (20) ----
  const types = new Set(sections.map((section) => section.type))
  const typeFor = (...candidates: string[]) => candidates.some((type) => types.has(type as never))
  checks.push(
    check(
      'summary',
      'Professional summary',
      4,
      summaryWords >= 20,
      summaryWords ? `Summary has ${summaryWords} words.` : 'No professional summary.',
      'Write 2–4 lines describing your role, strengths and what you have delivered.',
      true,
    ),
  )
  checks.push(
    check(
      'education-section',
      'Education section',
      4,
      typeFor('education'),
      typeFor('education') ? 'Education section found.' : 'No education section.',
      'Add an education section with your degree, institution and dates.',
    ),
  )
  checks.push(
    check(
      'experience-section',
      'Experience or projects section',
      4,
      typeFor('experience', 'projects', 'internships'),
      typeFor('experience', 'projects', 'internships')
        ? 'Experience, internship or project content found.'
        : 'No experience, internship or project content.',
      'Students can use projects and internships — no full-time job is required.',
    ),
  )
  checks.push(
    check(
      'skills-section',
      'Skills section',
      4,
      typeFor('skills'),
      typeFor('skills') ? 'Skills section found.' : 'No skills section.',
      'List your technical and soft skills so keyword matching can find them.',
    ),
  )

  const oddTitles = sections.filter((section) => {
    if (section.type === 'custom' || section.type === 'summary') return false
    const canonicalNames = STANDARD_HEADINGS[section.type]
    if (!canonicalNames) return false
    const title = section.title.toLowerCase()
    return !canonicalNames.some((name) => title.includes(name))
  })
  checks.push(
    check(
      'headings',
      'Standard section headings',
      4,
      oddTitles.length === 0,
      oddTitles.length === 0
        ? 'All section headings use standard names.'
        : `${oddTitles.length} section heading${oddTitles.length > 1 ? 's' : ''} may not be recognised: ${oddTitles
            .map((section) => `“${section.title}” (expected something like “${SECTION_LABELS[section.type]}”)`)
            .join(', ')}.`,
      'Rename headings to standard names such as “Work Experience” or “Education”.',
      true,
    ),
  )

  // ---- Content quality (20) ----
  checks.push(
    check(
      'bullets',
      'Bullet points',
      7,
      bullets.length >= 3,
      bullets.length ? `${bullets.length} bullet points found.` : 'No bullet points found.',
      'Use 1–2 lines per bullet for responsibilities and achievements.',
      true,
    ),
  )
  const longBullets = bullets.filter((bullet) => words(bullet) > 40)
  checks.push(
    check(
      'bullet-length',
      'Bullet length',
      7,
      bullets.length > 0 && longBullets.length === 0,
      bullets.length === 0
        ? 'No bullets to measure.'
        : longBullets.length === 0
          ? 'No bullet exceeds 40 words.'
          : `${longBullets.length} bullet${longBullets.length > 1 ? 's are' : ' is'} longer than 40 words.`,
      'Split long bullets in two, or cut detail that does not add evidence.',
      true,
    ),
  )
  const metricBullets = bullets.filter((bullet) => /\d/.test(bullet))
  checks.push(
    check(
      'metrics',
      'Measurable results',
      6,
      metricBullets.length > 0,
      metricBullets.length
        ? `${metricBullets.length} bullet${metricBullets.length > 1 ? 's mention' : ' mentions'} a number.`
        : 'No numbers, percentages or scale in your bullets.',
      'Add real numbers: team size, users, time saved, marks, ranking. Never invent them.',
      true,
    ),
  )

  // ---- Readability (20) ----
  const lengthStatus: CheckStatus = wordCount >= 250 && wordCount <= 900 ? 'pass' : wordCount > 0 ? 'warn' : 'fail'
  checks.push({
    id: 'length',
    label: 'Overall length',
    weight: 7,
    status: lengthStatus,
    detail: `${wordCount} words across the resume.`,
    suggestion:
      wordCount > 900
        ? 'Trim to the detail that proves impact — one page is ideal for under 10 years of experience.'
        : 'Aim for roughly 300–700 words (one page) unless you have a long career.',
  })
  const summaryStatus: CheckStatus = summaryWords >= 30 && summaryWords <= 120 ? 'pass' : 'warn'
  checks.push({
    id: 'summary-length',
    label: 'Summary readability',
    weight: 7,
    status: summaryWords ? summaryStatus : 'fail',
    detail: summaryWords ? `${summaryWords} words in the summary.` : 'No summary to read.',
    suggestion: 'Keep the summary between 30 and 120 words — about three sentences.',
  })
  const readableBullets = bullets.length > 0 && averageBulletWords >= 6 && averageBulletWords <= 35
  checks.push({
    id: 'bullet-readability',
    label: 'Bullet readability',
    weight: 6,
    status: bullets.length === 0 ? 'fail' : readableBullets ? 'pass' : 'warn',
    detail: bullets.length ? `Average bullet length is ${averageBulletWords} words.` : 'No bullets to read.',
    suggestion: 'Aim for 8–25 words per bullet, starting with an action verb.',
  })

  // ---- Keyword relevance (20) ----
  const resumeTokens = new Set(tokenize(text).map(canonical).map(stem))
  const jobKeywords = jobDescription.trim() ? extractJobKeywords(jobDescription) : []
  const matches: KeywordMatch[] = jobKeywords.map((keyword) => ({
    term: keyword.term,
    inResume: resumeTokens.has(keyword.key) || plain.includes(keyword.term),
    jobMentions: keyword.count,
  }))
  const coverage = matches.length ? matches.filter((match) => match.inResume).length / matches.length : 0

  if (jobDescription.trim()) {
    const status: CheckStatus = coverage >= 0.7 ? 'pass' : coverage >= 0.4 ? 'warn' : 'fail'
    checks.push({
      id: 'keywords',
      label: 'Job description keywords',
      weight: 20,
      status,
      detail: `${Math.round(coverage * 100)}% of the top ${matches.length} keywords from the job description appear in the resume.`,
      suggestion:
        status === 'pass'
          ? undefined
          : 'Add the missing skills you genuinely have to your Skills section, and use the same wording as the posting in your bullets.',
    })
  } else {
    // No job description: give the full 20 points so the score is not punished for a missing input.
    checks.push({
      id: 'keywords',
      label: 'Job description keywords',
      weight: 20,
      status: 'warn',
      detail: 'No job description pasted, so keyword relevance was not measured.',
      suggestion: 'Paste a job description to compare your resume against the exact wording.',
    })
  }

  const earned = checks.reduce((total, item) => {
    if (item.status === 'pass') return total + item.weight
    if (item.status === 'warn') return total + item.weight * 0.5
    return total
  }, 0)
  const score = Math.round(earned)

  return {
    score,
    grade: score >= 85 ? 'Strong' : score >= 70 ? 'Good' : score >= 55 ? 'Needs work' : 'Incomplete',
    checks,
    keywords: { used: Boolean(jobDescription.trim()), matches, coverage },
    stats: {
      wordCount,
      bulletCount: bullets.length,
      averageBulletWords,
      resumeKeywords: new Set(tokenize(text)).size,
    },
    suggestions: checks.filter((item) => item.status !== 'pass' && item.suggestion).map((item) => item.suggestion!),
  }
}

/** Candidate keywords the user may want to work into the resume (free, local, no API). */
export function suggestedKeywords(jobDescription: string, data: ResumeData): string[] {
  const resumeTokens = new Set(tokenize(resumePlainText(data)).map(canonical).map(stem))
  return extractJobKeywords(jobDescription)
    .filter((keyword) => !resumeTokens.has(keyword.key))
    .slice(0, 12)
    .map((keyword) => keyword.term)
}

export function skillGroupsForDisplay(data: ResumeData): Array<{ category: string; items: string[] }> {
  const section = data.sections.find((candidate) => candidate.type === 'skills' && candidate.visible)
  if (!section) return []
  return section.items
    .map((item) => ({ category: item.category ?? '', items: csv(item.items) }))
    .filter((group) => group.items.length > 0)
}
