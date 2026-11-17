import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Minus, Plus, Printer, Maximize2 } from 'lucide-react'
import type { Design, ResumeData } from '../../types/resume'
import { ResumeDocument } from '../resume/ResumeDocument'
import { cn } from '../../lib/utils'

const A4_WIDTH_PX = 793.7

export function PreviewPane({
  data,
  design,
  className,
  onPrint,
}: {
  data: ResumeData
  design: Design
  className?: string
  onPrint: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.85)
  const [autoFit, setAutoFit] = useState(true)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const update = () => {
      if (!autoFit) return
      const available = element.clientWidth - 40
      setZoom(Math.min(1, Math.max(0.35, available / A4_WIDTH_PX)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [autoFit])

  useEffect(() => {
    const node = paperRef.current
    if (!node) return
    const update = () => {
      const height = node.getBoundingClientRect().height / (zoom || 1)
      setPages(Math.max(1, Math.ceil(height / (297 * (96 / 25.4)))))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [data, design, zoom])

  // Only the editor should swap the page for the print document. Without this, printing
  // the dashboard or landing page would hide the app and produce a blank page.
  useEffect(() => {
    document.body.classList.add('has-print-root')
    return () => document.body.classList.remove('has-print-root')
  }, [])

  const changeZoom = (next: number) => {
    setAutoFit(false)
    setZoom(Math.min(1.3, Math.max(0.35, Number(next.toFixed(2)))))
  }

  return (
    <>
      <div className={cn('flex h-full min-h-0 flex-col', className)}>
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border bg-bg px-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-ghost h-7 w-7 rounded-md p-0"
              onClick={() => changeZoom(zoom - 0.1)}
              aria-label="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span className="w-11 text-center text-xs tabular-nums text-muted">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="btn btn-ghost h-7 w-7 rounded-md p-0"
              onClick={() => changeZoom(zoom + 0.1)}
              aria-label="Zoom in"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              className="btn btn-ghost ml-1 h-7 gap-1.5 rounded-md px-2 text-xs"
              onClick={() => setAutoFit(true)}
              aria-label="Fit page width"
            >
              <Maximize2 className="h-3 w-3" aria-hidden />
              Fit
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-muted sm:inline">
              A4 · {pages} page{pages > 1 ? 's' : ''}
            </span>
            <button type="button" onClick={onPrint} className="btn btn-secondary btn-sm">
              <Printer className="h-3.5 w-3.5" aria-hidden />
              Print
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="scroll-thin min-h-0 flex-1 overflow-auto bg-surface px-4 py-6">
          <div className="mx-auto w-fit" style={{ zoom: String(zoom) }}>
            <div ref={paperRef} className="paper-shadow rounded-[2px]">
              <ResumeDocument data={data} design={design} guides />
            </div>
          </div>
          <p className="mx-auto mt-4 max-w-md text-center text-[11px] leading-relaxed text-muted">
            Dashed lines mark A4 page breaks. The PDF export uses the same layout at exact A4 size.
          </p>
        </div>
      </div>

      {createPortal(
        <div className="print-root">
          <ResumeDocument data={data} design={design} />
        </div>,
        document.body,
      )}
    </>
  )
}
