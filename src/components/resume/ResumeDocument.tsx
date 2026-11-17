import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import type { Design, ResumeData, TemplateId } from '../../types/resume'
import { FONT_STACKS } from '../../lib/defaults'
import { cn } from '../../lib/utils'
import type { TemplateProps } from './shared'
import { ModernTemplate } from './templates/ModernTemplate'
import { MinimalAtsTemplate } from './templates/MinimalAtsTemplate'
import { ClassicTemplate } from './templates/ClassicTemplate'
import { StudentTemplate } from './templates/StudentTemplate'
import { DeveloperTemplate } from './templates/DeveloperTemplate'

const TEMPLATE_COMPONENTS: Record<TemplateId, ComponentType<TemplateProps>> = {
  modern: ModernTemplate,
  'minimal-ats': MinimalAtsTemplate,
  classic: ClassicTemplate,
  student: StudentTemplate,
  developer: DeveloperTemplate,
}

export function ResumeDocument({
  data,
  design,
  guides = false,
  className,
}: {
  data: ResumeData
  design: Design
  guides?: boolean
  className?: string
}) {
  const Template = TEMPLATE_COMPONENTS[design.template] ?? ModernTemplate
  const style = {
    '--rf-font': FONT_STACKS[design.fontFamily] ?? FONT_STACKS.inter,
    '--rf-font-size': `${design.fontSize}px`,
    '--rf-spacing': String(design.spacing),
    '--rf-accent': design.accent,
  } as CSSProperties

  return (
    <div className={cn('resume-paper', className)} style={style} data-template={design.template}>
      {/* The guide layer hugs the content so a short one-page resume shows no break line. */}
      <div className="relative">
        <Template data={data} design={design} />
        {guides && <div className="rf-guides" aria-hidden />}
      </div>
    </div>
  )
}

/** Scaled, clipped A4 preview used in template pickers and marketing sections. */
export function ResumeThumb({
  data,
  design,
  className,
}: {
  data: ResumeData
  design: Design
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.32)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const update = () => setZoom(element.clientWidth / 793.7)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn('relative aspect-[210/297] w-full overflow-hidden bg-white', className)}
    >
      <div className="pointer-events-none origin-top-left" style={{ zoom: String(zoom) }}>
        <ResumeDocument data={data} design={design} />
      </div>
    </div>
  )
}
