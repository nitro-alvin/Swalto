import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import type { ResumeRecord } from '../types/resume'
import { resumeRepo } from '../lib/db'
import { analyzeResume, type AtsCheck, type CheckStatus } from '../lib/ats'
import { getTemplateMeta } from '../lib/templateMeta'
import { Logo } from '../components/layout/Logo'
import { ThemeToggle } from '../components/theme'
import { Badge, Select, Textarea } from '../components/ui'
import { useToast } from '../components/toast'

const JD_KEY = 'swalto.jobDescription'

function ScoreRing({ score }: { score: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#4f46e5' : score >= 55 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`Score ${score} out of 100`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--rf-border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{score}</span>
        <span className="text-[10px] tracking-wide text-muted uppercase">of 100</span>
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass') return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
  if (status === 'warn') return <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
  return <XCircle className="h-4 w-4 text-rose-500" aria-hidden />
}

function CheckRow({ check }: { check: AtsCheck }) {
  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-0">
      <span className="mt-0.5 shrink-0">
        <StatusIcon status={check.status} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{check.label}</p>
          <span className="text-[10px] tracking-wide text-muted uppercase">
            {check.status === 'pass' ? 'Pass' : check.status === 'warn' ? 'Improve' : 'Missing'}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{check.detail}</p>
        {check.suggestion && check.status !== 'pass' && (
          <p className="mt-1 text-xs leading-relaxed text-fg/80">
            <span className="font-medium">Suggestion: </span>
            {check.suggestion}
          </p>
        )}
      </div>
    </li>
  )
}

export default function AtsPage() {
  const { push } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [resumes, setResumes] = useState<ResumeRecord[] | null>(null)
  const [jobDescription, setJobDescription] = useState(() => {
    try {
      return localStorage.getItem(JD_KEY) ?? ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    resumeRepo
      .list()
      .then(setResumes)
      .catch((error: unknown) => {
        push(error instanceof Error ? error.message : 'Could not load resumes.', 'error')
        setResumes([])
      })
  }, [push])

  useEffect(() => {
    try {
      localStorage.setItem(JD_KEY, jobDescription)
    } catch {
      /* storage is optional here */
    }
  }, [jobDescription])

  const selectedId = searchParams.get('resume') ?? ''
  const selected = resumes?.find((record) => record.id === selectedId) ?? resumes?.[0] ?? null

  const report = useMemo(
    () => (selected ? analyzeResume(selected.data, jobDescription) : null),
    [selected, jobDescription],
  )

  const priorityFixes = report?.checks.filter((check) => check.status !== 'pass' && check.suggestion).slice(0, 4) ?? []
  const matched = report?.keywords.matches.filter((match) => match.inResume) ?? []
  const missing = report?.keywords.matches.filter((match) => !match.inResume) ?? []

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              ATS checker
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/dashboard" className="btn btn-secondary btn-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ATS checker</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Check how your resume is structured, then compare it with a real job description. This is a
            transparent, rule-based check — the same things it flags are what parsers and recruiters
            commonly miss.
          </p>
        </div>

        {resumes !== null && resumes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Create a resume first</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              The checker analyses a resume saved in this browser. Build one, then come back to test it
              against a job posting.
            </p>
            <Link to="/dashboard" className="btn btn-primary btn-md mt-5">
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-4">
              <section className="card p-4">
                <label htmlFor="ats-resume" className="label">
                  Resume to analyse
                </label>
                {resumes === null ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Loading resumes…
                  </div>
                ) : (
                  <>
                    <Select
                      id="ats-resume"
                      value={selected?.id ?? ''}
                      onChange={(event) => {
                        setSearchParams({ resume: event.target.value }, { replace: true })
                      }}
                    >
                      {resumes.map((record) => (
                        <option key={record.id} value={record.id}>
                          {record.name}
                        </option>
                      ))}
                    </Select>
                    {selected && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Badge>{getTemplateMeta(selected.design.template).name}</Badge>
                        <Link
                          to={`/editor/${selected.id}`}
                          className="text-xs text-accent hover:underline"
                        >
                          Edit resume
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="card p-4">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="job-description" className="label">
                    Job description
                  </label>
                  <span className="text-[11px] text-muted">{jobDescription.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job posting here to compare keywords, skills and wording."
                  className="min-h-[200px] text-xs"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-muted">Optional, but the keyword check needs it.</p>
                  {jobDescription && (
                    <button
                      type="button"
                      className="text-[11px] text-muted hover:text-fg"
                      onClick={() => setJobDescription('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </section>

              <section className="card bg-surface/40 p-4 text-xs leading-relaxed text-muted">
                <h2 className="mb-2 text-sm font-semibold text-fg">What is checked</h2>
                <ul className="space-y-1.5">
                  <li>Contact information completeness</li>
                  <li>Standard, parseable section headings</li>
                  <li>Missing core sections and empty content</li>
                  <li>Bullet length, numbers and readability</li>
                  <li>Keyword overlap with the job description</li>
                </ul>
              </section>
            </div>

            {report && selected && (
              <div className="space-y-4">
                <section className="card p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <ScoreRing score={report.score} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">Resume health: {report.grade}</h2>
                        <Badge
                          tone={
                            report.score >= 85
                              ? 'success'
                              : report.score >= 70
                                ? 'accent'
                                : report.score >= 55
                                  ? 'warning'
                                  : 'danger'
                          }
                        >
                          {report.score}/100
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {report.score >= 85
                          ? 'Structure and content are in good shape. Focus on tailoring wording to the job.'
                          : report.score >= 70
                            ? 'A solid base. The items below are the fastest improvements.'
                            : 'Several basics are missing. Work through the checks below first.'}
                      </p>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
                        <div>
                          <dt className="text-muted">Words</dt>
                          <dd className="font-medium tabular-nums">{report.stats.wordCount}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Bullets</dt>
                          <dd className="font-medium tabular-nums">{report.stats.bulletCount}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Avg bullet</dt>
                          <dd className="font-medium tabular-nums">{report.stats.averageBulletWords} words</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Keyword match</dt>
                          <dd className="font-medium tabular-nums">
                            {report.keywords.used ? `${Math.round(report.keywords.coverage * 100)}%` : '—'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </section>

                {priorityFixes.length > 0 && (
                  <section className="card p-5">
                    <h2 className="text-sm font-semibold">Fix these first</h2>
                    <ol className="mt-2 space-y-2">
                      {priorityFixes.map((check) => (
                        <li key={check.id} className="flex gap-2 text-sm leading-relaxed text-muted">
                          <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                          <span>{check.suggestion}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {report.keywords.used && (
                  <section className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold">Job description keywords</h2>
                      <span className="text-xs text-muted">
                        {matched.length} of {report.keywords.matches.length} found
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.round(report.keywords.coverage * 100)}%` }}
                      />
                    </div>
                    <div className="mt-3">
                      <p className="text-[11px] tracking-wide text-muted uppercase">Found in your resume</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {matched.length === 0 && <span className="text-xs text-muted">None yet.</span>}
                        {matched.map((keyword) => (
                          <span
                            key={keyword.term}
                            className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-400"
                          >
                            {keyword.term}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-[11px] tracking-wide text-muted uppercase">
                        Worth adding — only if you genuinely have it
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {missing.length === 0 && <span className="text-xs text-muted">Nothing missing.</span>}
                        {missing.slice(0, 24).map((keyword) => (
                          <span
                            key={keyword.term}
                            className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted"
                          >
                            {keyword.term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className="card p-5">
                  <h2 className="text-sm font-semibold">All checks</h2>
                  <ul className="mt-1">
                    {report.checks.map((check) => (
                      <CheckRow key={check.id} check={check} />
                    ))}
                  </ul>
                </section>

                <p className="px-1 text-[11px] leading-relaxed text-muted">
                  Scores are guidance, not a guarantee. No tool can promise ATS approval or an interview,
                  and different systems parse resumes differently. Never add skills or experience you do
                  not have just to raise a score.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
