import { BODY_STYLES, SectionBody, contactParts, contentSections, type TemplateProps } from '../shared'
import type { ResumeSection } from '../../../types/resume'

const SIDEBAR_TYPES = ['skills', 'languages', 'certifications']

export function DeveloperTemplate({ data, design }: TemplateProps) {
  const { personal } = data
  const sections = contentSections(data)
  const twoColumn = design.layout === 'two-column'
  const main = twoColumn ? sections.filter((section) => !SIDEBAR_TYPES.includes(section.type)) : sections
  const side = twoColumn ? sections.filter((section) => SIDEBAR_TYPES.includes(section.type)) : []
  const contact = contactParts(personal)
  const style = twoColumn
    ? { ...BODY_STYLES.developer, stackSkills: true }
    : BODY_STYLES.developer

  const renderSection = (section: ResumeSection) => (
    <section className="rf-section" key={section.id}>
      <div className="rf-heading flex items-center gap-[0.5em]">
        <span className="h-[0.9em] w-[0.18em] rounded-full" style={{ background: 'var(--rf-accent)' }} />
        <h2 className="font-mono text-[0.8em] font-medium tracking-[0.09em] uppercase text-[#10151e]">
          {section.title}
        </h2>
      </div>
      <div className="mt-[0.55em]">
        <SectionBody section={section} data={data} style={style} />
      </div>
    </section>
  )

  return (
    <>
      <header className="rf-block">
        <h1 className="text-[2.25em] leading-[1.05] font-bold tracking-[-0.03em] text-[#0b0f16]">
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="mt-[0.2em] font-mono text-[0.98em] font-medium" style={{ color: 'var(--rf-accent)' }}>
            {personal.title}
          </p>
        )}
        {contact.length > 0 && (
          <div className="mt-[0.55em] flex flex-wrap gap-x-[0.9em] gap-y-[0.2em] font-mono text-[0.76em] text-[#4b5361]">
            {contact.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        )}
        <div className="mt-[0.9em] flex items-center gap-[0.5em]">
          <span className="h-[2px] w-[3.2em]" style={{ background: 'var(--rf-accent)' }} />
          <span className="h-px flex-1 bg-[#0f172a]/12" />
        </div>
      </header>

      {twoColumn && side.length > 0 ? (
        <div className="mt-[0.15em] grid items-start gap-[1.6em]" style={{ gridTemplateColumns: '1.6fr 0.9fr' }}>
          <div>{main.map(renderSection)}</div>
          <aside
            className="mt-[1.15em] rounded-[0.2em] p-[0.9em]"
            style={{ background: 'rgba(15, 23, 42, 0.035)' }}
          >
            {side.map((section) => (
              <section className="rf-section first:mt-0" key={section.id}>
                <h2
                  className="rf-heading font-mono text-[0.76em] font-medium tracking-[0.08em] uppercase"
                  style={{ color: 'var(--rf-accent)' }}
                >
                  {section.title}
                </h2>
                <div className="mt-[0.4em]">
                  <SectionBody section={section} data={data} style={style} />
                </div>
              </section>
            ))}
          </aside>
        </div>
      ) : (
        <div>{main.map(renderSection)}</div>
      )}
    </>
  )
}
