import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Copy,
  Download,
  FilePlus2,
  FileText,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import type { ResumeRecord, TemplateId } from '../types/resume'
import { resumeRepo } from '../lib/db'
import { formatDate, formatRelative } from '../lib/utils'
import { getTemplateMeta } from '../lib/templateMeta'
import { Logo } from '../components/layout/Logo'
import { ThemeToggle } from '../components/theme'
import { useToast } from '../components/toast'
import { ResumeThumb } from '../components/resume/ResumeDocument'
import {
  Badge,
  Button,
  ConfirmDialog,
  IconButton,
  Input,
  Modal,
  buttonClass,
} from '../components/ui'

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { push } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [records, setRecords] = useState<ResumeRecord[] | null>(null)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [renaming, setRenaming] = useState<ResumeRecord | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<ResumeRecord | null>(null)

  async function load() {
    try {
      setRecords(await resumeRepo.list())
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not read saved resumes.')
      setRecords([])
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function createResume(template?: TemplateId) {
    setCreating(true)
    try {
      const record = await resumeRepo.create(undefined, template)
      navigate(`/editor/${record.id}`)
    } catch (createError) {
      push(createError instanceof Error ? createError.message : 'Could not create a resume.', 'error')
      setCreating(false)
    }
  }

  async function duplicate(record: ResumeRecord) {
    setBusyId(record.id)
    try {
      await resumeRepo.duplicate(record.id)
      await load()
    } catch (duplicateError) {
      push(duplicateError instanceof Error ? duplicateError.message : 'Could not duplicate.', 'error')
    } finally {
      setBusyId('')
    }
  }

  async function confirmRename() {
    if (!renaming) return
    try {
      await resumeRepo.rename(renaming.id, renameValue)
      setRenaming(null)
      await load()
    } catch (renameError) {
      push(renameError instanceof Error ? renameError.message : 'Could not rename.', 'error')
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await resumeRepo.remove(deleting.id)
      setDeleting(null)
      await load()
    } catch (deleteError) {
      push(deleteError instanceof Error ? deleteError.message : 'Could not delete.', 'error')
    }
  }

  async function exportAll() {
    try {
      const bundle = await resumeRepo.exportAll()
      downloadJson(`swalto-backup-${new Date().toISOString().slice(0, 10)}.json`, bundle)
      push('Backup downloaded.', 'success')
    } catch (exportError) {
      push(exportError instanceof Error ? exportError.message : 'Export failed.', 'error')
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const result = await resumeRepo.importBundle(parsed)
      await load()
      push(
        `Imported ${result.imported} resume${result.imported === 1 ? '' : 's'}.`,
        'success',
      )
    } catch (importError) {
      push(
        importError instanceof Error ? importError.message : 'That file could not be imported.',
        'error',
      )
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs text-muted sm:inline">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/ats" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              ATS checker
            </Link>
            <ThemeToggle />
            <Button
              size="sm"
              onClick={() => createResume()}
              loading={creating}
              icon={<Plus className="h-4 w-4" aria-hidden />}
            >
              New resume
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My resumes</h1>
            <p className="mt-1.5 text-sm text-muted">
              {records === null
                ? 'Loading your resumes…'
                : records.length === 0
                  ? 'Saved privately in this browser. No account, no upload.'
                  : `${records.length} resume${records.length === 1 ? '' : 's'} saved privately in this browser.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={importFile}
              className="sr-only"
              aria-label="Import resume backup"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="h-3.5 w-3.5" aria-hidden />}
            >
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportAll}
              disabled={!records || records.length === 0}
              icon={<Download className="h-3.5 w-3.5" aria-hidden />}
            >
              Export backup
            </Button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-600 dark:text-rose-400"
          >
            {error}
          </div>
        )}

        {records === null ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="card animate-pulse overflow-hidden">
                <div className="aspect-[210/297] bg-surface" />
                <div className="space-y-2 p-4">
                  <div className="h-3.5 w-2/3 rounded bg-surface" />
                  <div className="h-3 w-1/3 rounded bg-surface" />
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-border bg-elevated">
              <FileText className="h-5 w-5 text-muted" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No resumes yet</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
              Create your first resume and it will appear here. You can keep as many versions as you
              like — one per role or company.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button
                onClick={() => createResume()}
                loading={creating}
                icon={<FilePlus2 className="h-4 w-4" aria-hidden />}
              >
                Create my first resume
              </Button>
              <Link to="/#templates" className={buttonClass('secondary', 'md')}>
                Start from a template
              </Link>
            </div>
            <p className="mt-5 text-[11px] text-muted">
              Already have a backup? Use <span className="font-medium">Import</span> above.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <article key={record.id} className="card group flex flex-col overflow-hidden">
                <Link
                  to={`/editor/${record.id}`}
                  className="relative block overflow-hidden border-b border-border bg-surface"
                  aria-label={`Edit ${record.name}`}
                >
                  {/* Cropped to the top of page one so the card actions stay above the fold. */}
                  <div className="h-[240px] overflow-hidden sm:h-[280px]">
                    <ResumeThumb data={record.data} design={record.design} />
                  </div>
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface to-transparent"
                    aria-hidden
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="truncate text-sm font-semibold">{record.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">Edited {formatRelative(record.updatedAt)}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge>{getTemplateMeta(record.design.template).name}</Badge>
                    <span className="truncate text-xs text-muted">
                      {record.data.personal.fullName || 'No name yet'}
                      {record.data.personal.title ? ` · ${record.data.personal.title}` : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">Created {formatDate(record.createdAt)}</p>

                  <div className="mt-auto flex items-center gap-0.5 border-t border-border pt-2.5">
                    <Link to={`/editor/${record.id}`} className="btn btn-ghost btn-sm px-2">
                      Edit
                    </Link>
                    <IconButton
                      label="Rename resume"
                      onClick={() => {
                        setRenaming(record)
                        setRenameValue(record.name)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </IconButton>
                    <IconButton
                      label="Duplicate resume"
                      disabled={busyId === record.id}
                      onClick={() => duplicate(record)}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    </IconButton>
                    <IconButton
                      label="Delete resume"
                      onClick={() => setDeleting(record)}
                      className="hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </IconButton>
                    <Link
                      to={`/ats?resume=${record.id}`}
                      className="btn btn-ghost btn-sm ml-auto px-2 text-[11px]"
                    >
                      ATS
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            <button
              type="button"
              onClick={() => createResume()}
              className="flex min-h-[220px] flex-col items-center justify-center gap-2 self-start rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-10 text-center transition-colors hover:border-accent/40 hover:bg-surface"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-elevated">
                <Plus className="h-4 w-4 text-muted" aria-hidden />
              </span>
              <span className="text-sm font-medium">New resume</span>
              <span className="text-xs text-muted">A fresh version for another role</span>
            </button>
          </div>
        )}

        <p className="mt-10 text-[11px] leading-relaxed text-muted">
          Resumes live in this browser's local storage, tied to this device. Export a backup before
          clearing browsing data or switching browsers.
        </p>
      </main>

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename resume"
        description="Give this version a name you can recognise later, like “Frontend — Acme”."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={!renameValue.trim()}>
              Save name
            </Button>
          </>
        }
      >
        <label htmlFor="rename-input" className="label">
          Resume name
        </label>
        <Input
          id="rename-input"
          data-autofocus
          value={renameValue}
          maxLength={80}
          onChange={(event) => setRenameValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && renameValue.trim()) void confirmRename()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete “${deleting?.name ?? ''}”?`}
        description="This permanently removes the resume and everything in it from this browser. This cannot be undone."
        confirmLabel="Delete resume"
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
