import { RotateCcw, Columns2, Rows3 } from 'lucide-react'
import type { Design, ResumeData } from '../../types/resume'
import { DEFAULT_ACCENTS, FONT_LABELS, FONT_STACKS, TEMPLATES, defaultDesign } from '../../lib/defaults'
import { cn } from '../../lib/utils'
import { ResumeThumb } from '../resume/ResumeDocument'
import { Button, Field, Select } from '../ui'

export function DesignPanel({
  design,
  data,
  onChange,
  onReset,
}: {
  design: Design
  data: ResumeData
  onChange: (patch: Partial<Design>) => void
  onReset: () => void
}) {
  const activeTemplate = TEMPLATES.find((template) => template.id === design.template) ?? TEMPLATES[0]
  const supportsTwoColumn = activeTemplate.columns === 'Single or two column'

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">Template</h3>
          <span className="text-[11px] text-muted">Switching keeps all your content</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {TEMPLATES.map((template) => {
            const active = template.id === design.template
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onChange({ template: template.id })}
                aria-pressed={active}
                className={cn(
                  'group overflow-hidden rounded-xl border bg-elevated text-left transition-all',
                  active
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'border-border hover:border-muted/50 hover:shadow-sm',
                )}
              >
                <ResumeThumb
                  data={data}
                  design={{ ...design, template: template.id }}
                  className="border-b border-border"
                />
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-medium">{template.name}</p>
                  <p className="truncate text-[10px] text-muted">{template.tone}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <Field label="Font family" htmlFor="design-font">
          <Select
            id="design-font"
            value={design.fontFamily}
            onChange={(event) => onChange({ fontFamily: event.target.value as Design['fontFamily'] })}
          >
            {Object.entries(FONT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <p className="-mt-2 text-[11px] text-muted" style={{ fontFamily: FONT_STACKS[design.fontFamily] }}>
          The quick brown fox jumps over the lazy dog.
        </p>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="design-size" className="text-xs font-medium tracking-wide text-muted">
              Font size
            </label>
            <span className="text-[11px] tabular-nums text-muted">{design.fontSize.toFixed(1)}px</span>
          </div>
          <input
            id="design-size"
            type="range"
            min={9}
            max={12.5}
            step={0.25}
            value={design.fontSize}
            onChange={(event) => onChange({ fontSize: Number(event.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--rf-accent)' }}
          />
          <div className="flex justify-between text-[10px] text-muted">
            <span>Compact</span>
            <span>Large</span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="design-spacing" className="text-xs font-medium tracking-wide text-muted">
              Section spacing
            </label>
            <span className="text-[11px] tabular-nums text-muted">{design.spacing.toFixed(2)}×</span>
          </div>
          <input
            id="design-spacing"
            type="range"
            min={0.8}
            max={1.4}
            step={0.05}
            value={design.spacing}
            onChange={(event) => onChange({ spacing: Number(event.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--rf-accent)' }}
          />
          <div className="flex justify-between text-[10px] text-muted">
            <span>Tight</span>
            <span>Airy</span>
          </div>
        </div>

        <div>
          <span className="label">Accent colour</span>
          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_ACCENTS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange({ accent: color })}
                aria-label={`Use accent colour ${color}`}
                aria-pressed={design.accent.toLowerCase() === color.toLowerCase()}
                className={cn(
                  'h-7 w-7 rounded-full border transition-transform hover:scale-110',
                  design.accent.toLowerCase() === color.toLowerCase()
                    ? 'border-fg ring-2 ring-accent/30 ring-offset-2 ring-offset-elevated'
                    : 'border-black/10',
                )}
                style={{ background: color }}
              />
            ))}
            <label className="relative inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-[10px] text-muted">
              <span aria-hidden>+</span>
              <input
                type="color"
                value={design.accent}
                onChange={(event) => onChange({ accent: event.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Custom accent colour"
              />
            </label>
            <span className="ml-1 font-mono text-[11px] tracking-wide text-muted uppercase">{design.accent}</span>
          </div>
        </div>
      </section>

      <section>
        <span className="label">Layout</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ layout: 'single' })}
            aria-pressed={design.layout === 'single'}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
              design.layout === 'single'
                ? 'border-accent bg-accent/5 text-fg'
                : 'border-border text-muted hover:bg-surface',
            )}
          >
            <Rows3 className="h-4 w-4" aria-hidden />
            Single column
          </button>
          <button
            type="button"
            onClick={() => onChange({ layout: 'two-column' })}
            aria-pressed={design.layout === 'two-column'}
            disabled={!supportsTwoColumn}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45',
              design.layout === 'two-column'
                ? 'border-accent bg-accent/5 text-fg'
                : 'border-border text-muted hover:bg-surface',
            )}
          >
            <Columns2 className="h-4 w-4" aria-hidden />
            Two column
          </button>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          {supportsTwoColumn
            ? 'Two columns move skills and languages into a sidebar. Best for one-page resumes; single column is safer for ATS parsing.'
            : `${activeTemplate.name} is a single-column ATS-first template, so a sidebar is not available.`}
        </p>
      </section>

      <div className="border-t border-border pt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
          className="w-full"
        >
          Reset styling to template defaults
        </Button>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Resets font, size, spacing, colour and layout. Your content is untouched. Defaults:{' '}
          {defaultDesign(design.template).fontSize.toFixed(1)}px, spacing{' '}
          {defaultDesign(design.template).spacing.toFixed(2)}×.
        </p>
      </div>
    </div>
  )
}
