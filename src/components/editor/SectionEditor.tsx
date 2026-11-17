import { useId, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type { ResumeData, ResumeSection } from '../../types/resume'
import { ITEM_LABELS, SECTION_FIELDS } from '../../lib/sections'
import { cn, words } from '../../lib/utils'
import { Button, ConfirmDialog, Field, IconButton, Input, Textarea } from '../ui'

type Props = {
  section: ResumeSection
  data: ResumeData
  index: number
  total: number
  defaultOpen: boolean
  composing: boolean
  onPatch: (patch: Partial<ResumeSection>) => void
  onDelete: () => void
  onMove: (direction: -1 | 1) => void
  onUpdateItem: (itemId: string, key: string, value: string) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onSummaryChange: (value: string) => void
  onComposeSummary: () => void
}

export function SectionEditor({
  section,
  data,
  index,
  total,
  defaultOpen,
  composing,
  onPatch,
  onDelete,
  onMove,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onSummaryChange,
  onComposeSummary,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const panelId = useId()
  const isSummary = section.type === 'summary'
  const fields = SECTION_FIELDS[section.type]
  const summaryWords = words(data.summary)

  return (
    <div className={cn('card overflow-hidden transition-colors', !section.visible && 'opacity-70')}>
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-surface/70"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
            aria-hidden
          />
          <span className="truncate text-sm font-medium">{section.title}</span>
          {!isSummary && section.items.length > 0 && (
            <span className="shrink-0 rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
              {section.items.length}
            </span>
          )}
          {!section.visible && (
            <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted">
              hidden
            </span>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            label={section.visible ? 'Hide section' : 'Show section'}
            onClick={() => onPatch({ visible: !section.visible })}
          >
            {section.visible ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
          </IconButton>
          <IconButton label="Move section up" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
          <IconButton label="Move section down" onClick={() => onMove(1)} disabled={index === total - 1}>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
          <IconButton label="Delete section" onClick={() => setConfirmDelete(true)} className="hover:text-rose-500">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
        </div>
      </div>

      {open && (
        <div id={panelId} className="border-t border-border px-3 py-3">
          {section.type === 'custom' && (
            <Field label="Section heading" htmlFor={`${panelId}-title`} className="mb-3">
              <Input
                id={`${panelId}-title`}
                value={section.title}
                onChange={(event) => onPatch({ title: event.target.value })}
                placeholder="Leadership"
              />
            </Field>
          )}

          {isSummary ? (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={`${panelId}-summary`} className="text-xs font-medium tracking-wide text-muted">
                  Professional summary
                </label>
                <span className="text-[11px] tabular-nums text-muted">{summaryWords} words</span>
              </div>
              <Textarea
                id={`${panelId}-summary`}
                value={data.summary}
                onChange={(event) => onSummaryChange(event.target.value)}
                placeholder="Two or three lines on who you are, what you do well, and the result you create."
                className="min-h-[110px]"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-muted">Aim for 30–120 words.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={composing}
                  onClick={onComposeSummary}
                  icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
                >
                  Draft from my details
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="rounded-xl border border-border bg-surface/40 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                      {ITEM_LABELS[section.type]} {itemIndex + 1}
                    </p>
                    <IconButton
                      label={`Remove ${ITEM_LABELS[section.type].toLowerCase()}`}
                      onClick={() => onRemoveItem(item.id)}
                      className="hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </IconButton>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {fields.map((field) => {
                      const id = `${panelId}-${item.id}-${field.key}`
                      const value = item[field.key] ?? ''
                      return (
                        <Field
                          key={field.key}
                          label={field.label}
                          htmlFor={id}
                          hint={field.hint}
                          className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}
                        >
                          {field.kind === 'list' ? (
                            <Textarea
                              id={id}
                              value={value}
                              rows={3}
                              placeholder={field.placeholder}
                              onChange={(event) => onUpdateItem(item.id, field.key, event.target.value)}
                            />
                          ) : (
                            <Input
                              id={id}
                              type={field.kind === 'url' ? 'url' : 'text'}
                              value={value}
                              placeholder={field.placeholder}
                              onChange={(event) => onUpdateItem(item.id, field.key, event.target.value)}
                            />
                          )}
                        </Field>
                      )
                    })}
                  </div>
                </div>
              ))}

              <Button
                size="sm"
                variant="secondary"
                onClick={onAddItem}
                icon={<Plus className="h-3.5 w-3.5" aria-hidden />}
                className="w-full"
              >
                Add {ITEM_LABELS[section.type].toLowerCase()}
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${section.title}”?`}
        description="This removes the section and everything in it from this resume. This cannot be undone."
        confirmLabel="Delete section"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          onDelete()
        }}
      />
    </div>
  )
}
