import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Download,
  Files,
  LayoutTemplate,
  ListOrdered,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { TemplateId } from '../types/resume'
import { DEFAULT_ACCENTS, TEMPLATES, defaultDesign, sampleData } from '../lib/defaults'
import { resumeRepo } from '../lib/db'
import { cn } from '../lib/utils'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import { ResumeThumb } from '../components/resume/ResumeDocument'
import { Badge, Button, buttonClass } from '../components/ui'
import { useToast } from '../components/toast'

const FEATURES: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: LayoutTemplate,
    title: 'Live A4 preview',
    body: 'Every edit lands on a real A4 page instantly, with page-break markers so nothing important drifts onto page two.',
  },
  {
    icon: Files,
    title: 'Five distinct templates',
    body: 'Professional, minimal ATS, classic, student and developer layouts. Switch at any time without losing a single word.',
  },
  {
    icon: Download,
    title: 'Real PDF export',
    body: 'Download a true A4 PDF with selectable text, preserved fonts and clean page breaks — or send it straight to a printer.',
  },
  {
    icon: ShieldCheck,
    title: 'ATS checker',
    body: 'See missing contact details, non-standard headings and unreadable bullets, then match your wording to a job description.',
  },
  {
    icon: ListOrdered,
    title: 'Full section control',
    body: 'Add, rename, hide, delete and reorder sections. No experience yet? Lead with education and projects instead.',
  },
  {
    icon: Lock,
    title: 'Private by default',
    body: 'Your resume is stored in your browser, not on a server. No account, no ads, no tracking pixels, no subscription.',
  },
]

const STEPS = [
  {
    title: 'Pick a template',
    body: 'Start with a layout built for your situation — a first job, a career change or a senior engineering role.',
  },
  {
    title: 'Fill in your details',
    body: 'Guided sections for personal details, education, projects, experience, skills and anything else you need.',
  },
  {
    title: 'Check it, export it',
    body: 'Run the ATS check against the job description, then download the A4 PDF and apply.',
  },
]

const PRICING_FREE = [
  'Unlimited resumes and versions',
  'All five templates',
  'Live A4 preview with page breaks',
  'PDF export and printing',
  'ATS checker with keyword matching',
  'Backup export and import',
  'No account, no ads, no card',
]

const FAQ = [
  {
    q: 'Is Swalto really free?',
    a: 'Yes. Every feature on this site — all templates, PDF export and the ATS checker — is free and usable today. There is no trial timer and no credit card field.',
  },
  {
    q: 'Where is my resume stored?',
    a: 'In your browser’s local storage on this device. Nothing is uploaded, so there is no account and no server copy. That also means clearing site data deletes your resumes — use Export backup in the dashboard to keep a copy.',
  },
  {
    q: 'Will this guarantee I pass an ATS?',
    a: 'No, and no honest tool can. The checker measures the things parsers commonly struggle with, like standard headings, readable bullets and keyword overlap. It is guidance for improving your resume, not a guarantee of approval or an interview.',
  },
  {
    q: 'Can I use it with no work experience?',
    a: 'Yes. The Student / Fresher template and the section controls are built for that. Lead with education, projects, internships and skills, and leave the experience section out entirely if you do not need it.',
  },
  {
    q: 'How does the PDF export work?',
    a: 'It prints the actual resume document at exact A4 size using your browser’s PDF engine, so text stays selectable, fonts stay intact and pages break properly. In the print dialog choose “Save as PDF” and keep the A4 paper size.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. The editor switches between an edit view and a full preview on small screens, and the exported PDF is identical to the desktop version.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { push } = useToast()
  const [creating, setCreating] = useState(false)
  const sample = useMemo(() => sampleData(), [])
  const heroDesign = useMemo(() => defaultDesign('modern'), [])

  async function createResume(template?: TemplateId) {
    setCreating(true)
    try {
      const record = await resumeRepo.create(undefined, template)
      navigate(`/editor/${record.id}`)
    } catch (error) {
      push(error instanceof Error ? error.message : 'Could not create a resume.', 'error')
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
          <div className="pointer-events-none absolute top-[-14rem] left-1/2 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="animate-fade-up">
                <span className="chip gap-1.5">
                  <Sparkles className="h-3 w-3 text-accent" aria-hidden />
                  Free forever · No account required
                </span>
                <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
                  Build a Resume That <span className="text-accent">Gets Noticed.</span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                  Swalto turns your details into a clean, ATS-friendly resume — live A4 preview,
                  five professional templates, an honest keyword checker and a proper PDF download.
                  Built for students, freshers and experienced professionals alike.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    loading={creating}
                    onClick={() => createResume()}
                    icon={<ArrowRight className="h-4 w-4" aria-hidden />}
                  >
                    Create My Resume
                  </Button>
                  <a href="#templates" className={buttonClass('secondary', 'lg')}>
                    Explore Templates
                  </a>
                </div>
                <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm text-muted">
                  {['5 ATS-ready templates', 'Live A4 page preview', 'PDF export included', 'Works offline'].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <p className="mt-6 text-xs text-muted">
                  No sign-up. Your resume stays in this browser.
                </p>
              </div>

              <div className="animate-fade-up relative mx-auto w-full max-w-[400px] lg:max-w-none">
                <div className="absolute -top-4 -right-3 z-10 hidden rotate-2 rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-[10px] font-medium text-muted shadow-sm sm:block">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ATS-friendly structure
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-elevated p-1.5 shadow-2xl">
                  <div className="flex items-center gap-2 px-1.5 pb-1.5">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-border" />
                      <span className="h-2 w-2 rounded-full bg-border" />
                      <span className="h-2 w-2 rounded-full bg-border" />
                    </span>
                    <span className="mx-auto rounded-md bg-surface px-2 py-0.5 text-[9px] text-muted">
                      swalto · editor
                    </span>
                  </div>
                  <div className="max-h-[520px] overflow-hidden rounded-lg border border-border">
                    <ResumeThumb data={sample} design={heroDesign} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="scroll-mt-20 border-y border-border bg-surface/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Templates</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Five templates. One honest, readable resume.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Each layout is a real template you can use immediately — not a screenshot. Switch
                  between them at any point and every detail carries over.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => createResume()}
                loading={creating}
                icon={<Plus className="h-4 w-4" aria-hidden />}
                className="shrink-0"
              >
                Start with a blank resume
              </Button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((template) => (
                <article
                  key={template.id}
                  className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="border-b border-border bg-surface/60 p-2">
                    <div className="overflow-hidden rounded-md border border-border bg-white">
                      <ResumeThumb data={sample} design={defaultDesign(template.id)} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold">{template.name}</h3>
                      <Badge tone="neutral">{template.tone}</Badge>
                    </div>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">{template.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="text-[11px] text-muted">{template.columns}</span>
                      <Button variant="secondary" size="sm" onClick={() => createResume(template.id)}>
                        Use template
                      </Button>
                    </div>
                  </div>
                </article>
              ))}

              <article className="flex flex-col justify-center rounded-2xl border border-dashed border-border bg-bg/60 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-elevated">
                  <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                </span>
                <h3 className="mt-3 text-sm font-semibold">Not sure which one?</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Start with Modern Professional. Apply to a careers portal? Use Minimal ATS. No
                  experience? Student / Fresher. You can switch later in one click.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 self-start"
                  onClick={() => createResume('modern')}
                  loading={creating}
                >
                  Create a resume
                </Button>
              </article>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Features</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you need to finish the resume, not just start it.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Built to be practical: accurate page layout, real exports and feedback you can act on.
              </p>
            </div>
            <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-elevated">
                    <feature.icon className="h-4 w-4 text-accent" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-surface/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">How it works</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                From blank page to ready-to-send in one sitting.
              </h2>
            </div>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative rounded-2xl border border-border bg-bg p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ATS */}
        <section className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">ATS checker</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Send it knowing what a parser sees.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Paste the job description and Swalto compares it with your resume: contact details,
                standard headings, missing sections, bullet readability and keyword overlap. You get
                specific, plain-English fixes — not a vague grade.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Contact information and link completeness',
                  'Standard section headings parsers recognise',
                  'Empty or missing core sections',
                  'Bullet length, numbers and readability',
                  'Keyword coverage against the posting',
                  'Clear, prioritised suggestions',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/ats" className={buttonClass('secondary', 'md')}>
                  Open ATS checker
                </Link>
                <Link to="/dashboard" className="text-sm text-accent hover:underline">
                  Check a saved resume
                </Link>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface/60 px-4 py-3">
                <span className="text-xs font-medium">Resume health</span>
                <Badge tone="warning">Guidance, not a guarantee</Badge>
              </div>
              <div className="space-y-4 p-5">
                {[
                  { label: 'Contact details', state: 'Complete email, phone and location', tone: 'ok' },
                  { label: 'Standard headings', state: 'Work Experience and Education found', tone: 'ok' },
                  { label: 'Professional summary', state: 'Add 2–3 lines describing your focus', tone: 'warn' },
                  { label: 'Measurable results', state: 'Only 1 of 6 bullets includes a number', tone: 'warn' },
                  { label: 'Keywords', state: 'Paste a job description to compare wording', tone: 'muted' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        row.tone === 'ok' ? 'bg-emerald-500' : row.tone === 'warn' ? 'bg-amber-500' : 'bg-border',
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted">{row.state}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-lg border border-border bg-surface/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
                  No score guarantees ATS approval or an interview. Never add skills or experience you
                  do not have just to raise a number.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 border-y border-border bg-surface/40 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Pricing</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Free. All of it, for everyone.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                One plan with every feature unlocked. No upgrades, no trial, no account, no card.
              </p>
            </div>

            <div className="card relative mx-auto mt-10 max-w-lg p-6 ring-2 ring-accent sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Everything included</h3>
                  <p className="mt-1 text-xs text-muted">All features, unlimited use, forever</p>
                </div>
                <Badge tone="accent">$0 forever</Badge>
              </div>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">$0</span>
                <span className="text-sm text-muted">/ no paid plans</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {PRICING_FREE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                onClick={() => createResume()}
                loading={creating}
                icon={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Start building — free
              </Button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                No payment details are collected anywhere in Swalto. Accent colours:{' '}
                {DEFAULT_ACCENTS.length} presets plus a custom picker.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">FAQ</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Questions people actually ask.
              </h2>
            </div>
            <div className="mt-8 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="card group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                    {item.q}
                    <Plus
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-elevated px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Your next role starts with a clearer resume.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Pick a template, fill in what you have, and leave with a PDF you can send today.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => createResume()}
                loading={creating}
                icon={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Create My Resume
              </Button>
              <a href="#templates" className={buttonClass('secondary', 'lg')}>
                Explore Templates
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
