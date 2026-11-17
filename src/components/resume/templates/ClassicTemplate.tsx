import { BODY_STYLES, SectionBody, contactParts, contentSections, type TemplateProps } from '../shared'
import type { ResumeSection } from '../../../types/resume'

export function ClassicTemplate({ data }: TemplateProps) {
  const { personal } = data
  const sections = contentSections(data)
  const contact = contactParts(personal)

  const renderSection = (section: ResumeSection) => (
    <section className="rf-section" key={section.id}>
      <div className="rf-heading">
        <h2 className="text-center text-[0.82em] font-bold tracking-[0.24em] uppercase text-[#17181c]">
          {section.title}
        </h2>
        <div className="mt-[0.3em] h-px w-full bg-[#1f2937]/25" />
      </div>
      <div className="mt-[0.55em]">
        <SectionBody section={section} data={data} style={BODY_STYLES.classic} />
      </div>
    </section>
  )

  return (
    <>
      <header className="rf-block text-center">
        <h1 className="text-[2.2em] leading-[1.1] font-bold tracking-[0.01em] text-[#111216]">
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="mt-[0.18em] text-[0.98em] italic text-[#2c2f36]">{personal.title}</p>
        )}
        {contact.length > 0 && (
          <p className="mt-[0.45em] text-[0.84em] leading-[1.6] text-[#3b3f47]">
            {contact.join('   ·   ')}
          </p>
        )}
        <div className="mt-[0.75em] border-t-2 border-double border-[#1f2937]/60" />
      </header>
      <div>{sections.map(renderSection)}</div>
    </>
  )
}
