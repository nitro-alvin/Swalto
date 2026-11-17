import { BODY_STYLES, SectionBody, contactParts, contentSections, type TemplateProps } from '../shared'
import type { ResumeSection } from '../../../types/resume'

export function StudentTemplate({ data }: TemplateProps) {
  const { personal } = data
  const sections = contentSections(data)
  const contact = contactParts(personal)

  const renderSection = (section: ResumeSection) => (
    <section className="rf-section" key={section.id}>
      <div className="rf-heading flex items-center gap-[0.6em]">
        <h2
          className="rounded-[0.3em] px-[0.5em] py-[0.12em] text-[0.78em] font-bold tracking-[0.1em] text-white uppercase"
          style={{ background: 'var(--rf-accent)' }}
        >
          {section.title}
        </h2>
        <span
          className="h-px flex-1"
          style={{ background: 'color-mix(in oklab, var(--rf-accent) 22%, transparent)' }}
        />
      </div>
      <div className="mt-[0.6em]">
        <SectionBody section={section} data={data} style={BODY_STYLES.student} />
      </div>
    </section>
  )

  return (
    <>
      <header className="rf-block">
        <div className="flex items-center gap-[0.9em]">
          <span
            className="h-[2.6em] w-[0.28em] shrink-0 rounded-full"
            style={{ background: 'var(--rf-accent)' }}
          />
          <div className="min-w-0">
            <h1 className="text-[2.2em] leading-[1.05] font-bold tracking-[-0.02em] text-[#0c1211]">
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.title && (
              <p className="mt-[0.2em] text-[1em] font-medium" style={{ color: 'var(--rf-accent)' }}>
                {personal.title}
              </p>
            )}
          </div>
        </div>
        {contact.length > 0 && (
          <div className="mt-[0.8em] flex flex-wrap gap-[0.35em]">
            {contact.map((item, index) => (
              <span
                key={index}
                className="rounded-full px-[0.65em] py-[0.18em] text-[0.8em] text-[#33413f]"
                style={{ background: 'color-mix(in oklab, var(--rf-accent) 8%, #ffffff)' }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </header>
      <div>{sections.map(renderSection)}</div>
    </>
  )
}
