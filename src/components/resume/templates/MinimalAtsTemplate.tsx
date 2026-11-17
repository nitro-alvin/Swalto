import { BODY_STYLES, SectionBody, contactParts, contentSections, type TemplateProps } from '../shared'
import type { ResumeSection } from '../../../types/resume'

/**
 * Deliberately plain: one column, black text, standard headings, no tables or graphics.
 * This is the format applicant tracking systems parse most reliably.
 */
export function MinimalAtsTemplate({ data }: TemplateProps) {
  const { personal } = data
  const sections = contentSections(data)
  const contact = contactParts(personal)

  const renderSection = (section: ResumeSection) => (
    <section className="rf-section" key={section.id}>
      <h2 className="rf-heading border-b border-black pb-[0.18em] text-[0.86em] font-bold tracking-[0.08em] uppercase">
        {section.title}
      </h2>
      <div className="mt-[0.5em]">
        <SectionBody section={section} data={data} style={BODY_STYLES.minimal} />
      </div>
    </section>
  )

  return (
    <>
      <header className="rf-block">
        <h1 className="text-[2.05em] leading-[1.1] font-bold tracking-[-0.01em] text-black">
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && <p className="mt-[0.15em] text-[1em] text-black">{personal.title}</p>}
        {contact.length > 0 && (
          <p className="mt-[0.4em] text-[0.88em] leading-[1.5] text-black">
            {contact.map((item) => item).join('  |  ')}
          </p>
        )}
        <div className="mt-[0.85em] border-t-2 border-black" />
      </header>
      <div>{sections.map(renderSection)}</div>
    </>
  )
}
