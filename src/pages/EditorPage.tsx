import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CloudOff,
  Download,
  FileQuestion,
  LayoutList,
  Loader2,
  MoreHorizontal,
  Palette,
  Plus,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import type { Design, Personal, ResumeRecord, ResumeSection, SectionType } from '../types/resume'
import { resumeRepo } from '../lib/db'
import { ADDABLE_SECTIONS, SECTION_LABELS, emptyItem } from '../lib/sections'
import { TEMPLATES, defaultDesign, makeSection } from '../lib/defaults'
import { getAiProvider } from '../lib/ai'
import { cn, uid } from '../lib/utils'
import { getTemplateMeta } from '../lib/templateMeta'
import { Logo } from '../components/layout/Logo'
import { ThemeToggle } from '../components/theme'
import { useToast } from '../components/toast'
import { Button, Spinner } from '../components/ui'
import { PersonalFields } from '../components/editor/PersonalFields'
import { SectionEditor } from '../components/editor/SectionEditor'
import { DesignPanel } from '../components/editor/DesignPanel'
import { PreviewPane } from '../components/editor/PreviewPane'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function EditorPage() {
  const { id = '' } = useParams()
  const { push } = useToast()

  const [record, setRecord] = useState<ResumeRecord | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const [composing, setComposing] = useState(false)
  const [newSectionId, setNewSectionId] = useState('')

  const recordRef = useRef<ResumeRecord | null>(null)
  const timerRef = useRef<number | null>(null)
  const dirtyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    setLoadState('loading')
    resumeRepo
      .get(id)
      .then((found) => {
        if (cancelled) return
        if (!found) {
          setLoadState('missing')
          return
        }
        recordRef.current = found
        setRecord(found)
        setLoadState('ready')
        setSaveState('saved')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const persist = useCallback(
    async (next: ResumeRecord) => {
      try {
        await resumeRepo.update(next)
        dirtyRef.current = false
        setSaveState('saved')
      } catch (error) {
        setSaveState('error')
        push(error instanceof Error ? error.message : 'Could not save your resume.', 'error')
      }
    },
    [push],
  )

  const commit = useCallback(
    (updater: (current: ResumeRecord) => ResumeRecord) => {
      const current = recordRef.current
      if (!current) return
      const next = updater(current)
      recordRef.current = next
      dirtyRef.current = true
      setRecord(next)
      setSaveState('saving')
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        const latest = recordRef.current
        if (latest) void persist(latest)
      }, 550)
    },
    [persist],
  )

  const flush = useCallback(async () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const latest = recordRef.current
    if (latest && dirtyRef.current) await persist(latest)
  }, [persist])

  // Save any pending edit when leaving the editor.
  useEffect(() => {
    return () => {
      void flush()
    }
  }, [flush])

  const updatePersonal = (patch: Partial<Personal>) =>
    commit((current) => ({
      ...current,
      data: { ...current.data, personal: { ...current.data.personal, ...patch } },
    }))

  const setSummary = (summary: string) =>
    commit((current) => ({ ...current, data: { ...current.data, summary } }))

  const patchSection = (sectionId: string, patch: Partial<ResumeSection>) =>
    commit((current) => ({
      ...current,
      data: {
        ...current.data,
        sections: current.data.sections.map((section) =>
          section.id === sectionId ? { ...section, ...patch } : section,
        ),
      },
    }))

  const updateItem = (sectionId: string, itemId: string, key: string, value: string) =>
    commit((current) => ({
      ...current,
      data: {
        ...current.data,
        sections: current.data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, [key]: value } : item,
                ),
              }
            : section,
        ),
      },
    }))

  const addItem = (sectionId: string) =>
    commit((current) => ({
      ...current,
      data: {
        ...current.data,
        sections: current.data.sections.map((section) => {
          if (section.id !== sectionId) return section
          const blank = emptyItem(section.type, uid('item'))
          return { ...section, items: [...section.items, blank] }
        }),
      },
    }))

  const removeItem = (sectionId: string, itemId: string) =>
    commit((current) => ({
      ...current,
      data: {
        ...current.data,
        sections: current.data.sections.map((section) =>
          section.id === sectionId
            ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
            : section,
        ),
      },
    }))

  const addSection = (type: SectionType) => {
    const section = makeSection(type, type === 'summary' ? 0 : 1)
    commit((current) => ({
      ...current,
      data: { ...current.data, sections: [...current.data.sections, section] },
    }))
    // Open the new section immediately so its fields are ready to fill in.
    setNewSectionId(section.id)
  }

  const deleteSection = (sectionId: string) =>
    commit((current) => ({
      ...current,
      data: {
        ...current.data,
        sections: current.data.sections.filter((section) => section.id !== sectionId),
      },
    }))

  const moveSection = (sectionId: string, direction: -1 | 1) =>
    commit((current) => {
      const sections = [...current.data.sections]
      const index = sections.findIndex((section) => section.id === sectionId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= sections.length) return current
      const [moved] = sections.splice(index, 1)
      sections.splice(target, 0, moved)
      return { ...current, data: { ...current.data, sections } }
    })

  const updateDesign = (patch: Partial<Design>) =>
    commit((current) => {
      const next: Design = { ...current.design, ...patch }
      const meta = TEMPLATES.find((template) => template.id === next.template)
      if (meta && meta.columns === 'Single column') next.layout = 'single'
      return { ...current, design: next }
    })

  const resetDesign = () =>
    commit((current) => ({ ...current, design: defaultDesign(current.design.template) }))

  const composeSummary = async () => {
    const current = recordRef.current
    if (!current) return
    setComposing(true)
    try {
      const text = await getAiProvider().generateSummary({ data: current.data })
      if (!text) {
        push('Add a title, skills, education or a project first — the draft only uses facts you entered.', 'info')
        return
      }
      setSummary(text)
      push('Draft added from your own details. Edit it so every claim is accurate.', 'success')
    } catch {
      push('Could not draft a summary right now. You can still write one yourself.', 'error')
    } finally {
      setComposing(false)
    }
  }

  const printResume = useCallback(async () => {
    await flush()
    window.print()
  }, [flush])

  if (loadState === 'loading') {
    return (
      <div className="min-h-dvh">
        <EditorTopBar name="Loading…" saving={false} />
        <Spinner label="Opening your resume…" />
      </div>
    )
  }

  if (loadState === 'missing' || loadState === 'error' || !record) {
    return (
      <div className="min-h-dvh">
        <EditorTopBar name="Resume not found" saving={false} />
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <FileQuestion className="mx-auto h-10 w-10 text-muted" aria-hidden />
          <h1 className="mt-4 text-xl font-semibold">
            {loadState === 'error' ? 'Something went wrong' : 'This resume is not on this device'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {loadState === 'error'
              ? 'The resume could not be read from browser storage. Try reloading the page.'
              : 'It may have been deleted, or it was created in a different browser. Resumes are stored locally in this browser.'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/dashboard" className="btn btn-primary btn-md">
              Back to dashboard
            </Link>
            <Link to="/" className="btn btn-secondary btn-md">
              Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const template = getTemplateMeta(record.design.template)
  const existingTypes = new Set(record.data.sections.map((section) => section.type))
  const addable = ADDABLE_SECTIONS.filter((type) => type === 'custom' || !existingTypes.has(type))

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <EditorTopBar
        name={record.name}
        onRename={(name) => commit((current) => ({ ...current, name }))}
        resumeId={record.id}
        saving={saveState === 'saving'}
        failed={saveState === 'error'}
        onPrint={printResume}
      />

      <div className="flex items-center gap-3 border-b border-border px-3 py-1.5 lg:hidden">
        <div className="flex rounded-lg bg-surface p-0.5">
          {(['edit', 'preview'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setMobileView(view)}
              aria-pressed={mobileView === view}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                mobileView === view ? 'bg-elevated text-fg shadow-sm' : 'text-muted',
              )}
            >
              {view}
            </button>
          ))}
        </div>
        <span className="ml-auto truncate text-[11px] text-muted">{template.name}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className={cn(
            'min-h-0 w-full shrink-0 flex-col border-border bg-bg lg:flex lg:w-[400px] lg:border-r xl:w-[440px]',
            mobileView === 'preview' ? 'hidden lg:flex' : 'flex',
          )}
        >
          <div className="flex gap-1 border-b border-border px-2 py-1.5">
            <button
              type="button"
              onClick={() => setTab('content')}
              aria-pressed={tab === 'content'}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                tab === 'content' ? 'bg-surface text-fg' : 'text-muted hover:text-fg',
              )}
            >
              <LayoutList className="h-3.5 w-3.5" aria-hidden />
              Content
            </button>
            <button
              type="button"
              onClick={() => setTab('design')}
              aria-pressed={tab === 'design'}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                tab === 'design' ? 'bg-surface text-fg' : 'text-muted hover:text-fg',
              )}
            >
              <Palette className="h-3.5 w-3.5" aria-hidden />
              Design
            </button>
          </div>

          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-28">
            {tab === 'content' ? (
              <div className="space-y-3">
                <section className="card p-3">
                  <h2 className="mb-2.5 text-sm font-semibold">Personal information</h2>
                  <PersonalFields personal={record.data.personal} onChange={updatePersonal} />
                </section>

                {record.data.sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    data={record.data}
                    index={index}
                    total={record.data.sections.length}
                    defaultOpen={index === 0 || section.id === newSectionId}
                    composing={composing}
                    onPatch={(patch) => patchSection(section.id, patch)}
                    onDelete={() => deleteSection(section.id)}
                    onMove={(direction) => moveSection(section.id, direction)}
                    onUpdateItem={(itemId, key, value) => updateItem(section.id, itemId, key, value)}
                    onAddItem={() => addItem(section.id)}
                    onRemoveItem={(itemId) => removeItem(section.id, itemId)}
                    onSummaryChange={setSummary}
                    onComposeSummary={composeSummary}
                  />
                ))}

                <section className="card p-3">
                  <h2 className="text-sm font-semibold">Add a section</h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    Add anything else that strengthens your application. Custom sections are free-form.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {addable.length === 0 && (
                      <p className="text-xs text-muted">Every optional section is already on your resume.</p>
                    )}
                    {addable.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addSection(type)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-elevated px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg"
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                        {SECTION_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </section>

                <p className="px-1 text-[11px] leading-relaxed text-muted">
                  Everything is saved automatically in this browser. Export a backup from the dashboard
                  before clearing site data.
                </p>
              </div>
            ) : (
              <DesignPanel
                design={record.design}
                data={record.data}
                onChange={updateDesign}
                onReset={resetDesign}
              />
            )}
          </div>
        </aside>

        <main
          className={cn(
            'min-h-0 min-w-0 flex-1 bg-surface',
            mobileView === 'edit' ? 'hidden lg:block' : 'block',
          )}
        >
          <PreviewPane data={record.data} design={record.design} onPrint={printResume} />
        </main>
      </div>
    </div>
  )
}

function EditorTopBar({
  name,
  onRename,
  resumeId,
  saving = false,
  failed = false,
  onPrint,
}: {
  name: string
  onRename?: (name: string) => void
  resumeId?: string
  saving?: boolean
  failed?: boolean
  onPrint?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg px-2.5 sm:px-3">
      <Link
        to="/dashboard"
        className="btn btn-ghost h-8 w-8 shrink-0 rounded-lg p-0"
        aria-label="Back to dashboard"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </Link>
      <div className="hidden sm:block">
        <Logo to="/" className="mr-1" />
      </div>
      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

      <div className="min-w-0 flex-1">
        {onRename ? (
          <input
            value={name}
            onChange={(event) => onRename(event.target.value)}
            aria-label="Resume name"
            className="w-full max-w-[260px] truncate rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-sm font-semibold hover:border-border focus:border-accent focus:bg-elevated focus:outline-none"
          />
        ) : (
          <p className="truncate px-1.5 text-sm font-semibold">{name}</p>
        )}
        <p className="flex items-center gap-1 px-1.5 text-[10px] text-muted" aria-live="polite">
          {saving ? (
            <>
              <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden /> Saving…
            </>
          ) : failed ? (
            <>
              <CloudOff className="h-2.5 w-2.5 text-rose-500" aria-hidden /> Not saved — storage unavailable
            </>
          ) : (
            <>
              <Check className="h-2.5 w-2.5 text-emerald-500" aria-hidden /> Saved on this device
            </>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {resumeId && (
          <Link
            to={`/ats?resume=${resumeId}`}
            className="btn btn-ghost btn-sm hidden md:inline-flex"
            title="Check this resume against a job description"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            ATS check
          </Link>
        )}
        {onPrint && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPrint}
            icon={<Printer className="h-3.5 w-3.5" aria-hidden />}
            className="hidden sm:inline-flex"
          >
            Print
          </Button>
        )}
        {(resumeId || onPrint) && (
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="btn btn-secondary h-8 w-8 rounded-lg p-0"
              aria-label="More actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-1.5 w-48 rounded-xl border border-border bg-elevated p-1 shadow-lg"
                >
                  {resumeId && (
                    <Link
                      role="menuitem"
                      to={`/ats?resume=${resumeId}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-fg hover:bg-surface"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                      ATS check
                    </Link>
                  )}
                  {onPrint && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        onPrint()
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-fg hover:bg-surface"
                    >
                      <Printer className="h-3.5 w-3.5" aria-hidden />
                      Print / save as PDF
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {onPrint && (
          <Button
            size="sm"
            onClick={onPrint}
            icon={<Download className="h-3.5 w-3.5" aria-hidden />}
            title="Opens the print dialog — choose Save as PDF with A4 paper"
          >
            PDF
          </Button>
        )}
        <ThemeToggle className="h-8 w-8" />
      </div>
    </header>
  )
}

