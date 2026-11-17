import { BODY_STYLES, SectionBody, contactParts, contentSections, type TemplateProps } from '../shared'
import type { ResumeSection } from '../../../types/resume'

const SIDEBAR_TYPES = ['skills', 'languages', 'certifications', 'awards']

export function ModernTemplate({ data, design }: TemplateProps) {
  const { personal } = data
  const sections = contentSections(data)
  const twoColumn = design.layout === 'two-column'
  const main = twoColumn ? sections.filter((section) => !SIDEBAR_TYPES.includes(section.type)) : sections
  const side = twoColumn ? sections.filter((section) => SIDEBAR_TYPES.includes(section.type)) : []
  const contact = contactParts(personal)
  const style = twoColumn
    ? { ...BODY_STYLES.modern, stackSkills: true }
    : BODY_STYLES.modern

  const renderSection = (section: ResumeSection) => (
    <section className="rf-section" key={section.id}>
      <div className="rf-heading flex items-center gap-[0.7em]">
        <h2
          className="text-[0.74em] font-semibold tracking-[0.16em] uppercase"
          style={{ color: 'var(--rf-accent)' }}
        >
          {section.title}
        </h2>
        <span
          className="h-px flex-1"
          style={{ background: 'color-mix(in oklab, var(--rf-accent) 26%, transparent)' }}
        />
      </div>
      <div className="mt-[0.55em]">
        <SectionBody section={section} data={data} style={style} />
      </div>
    </section>
  )

  return (
    <>
      <header className="rf-block">
        <h1 className="text-[2.3em] leading-[1.05] font-semibold tracking-[-0.025em] text-[#0d0f14]">
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="mt-[0.3em] text-[1.02em] font-medium" style={{ color: 'var(--rf-accent)' }}>
            {personal.title}
          </p>
        )}
        {contact.length > 0 && (
          <div className="mt-[0.8em] flex flex-wrap items-center gap-x-[0.9em] gap-y-[0.25em] text-[0.84em] text-[#4b5563]">
            {contact.map((item, index) => (
              <span key={index} className="flex items-center gap-[0.9em]">
                {index > 0 && <span className="text-[#c3c7ce]">|</span>}
                <span>{item}</span>
              </span>
            ))}
          </div>
        )}
        <div className="mt-[1em] h-[1.5px] w-full" style={{ background: 'var(--rf-accent)' }} />
      </header>

      {twoColumn && side.length > 0 ? (
        <div className="mt-[0.2em] grid items-start gap-[1.6em]" style={{ gridTemplateColumns: '1.55fr 0.95fr' }}>
          <div>{main.map(renderSection)}</div>
          <aside
            className="mt-[1.15em] border-l pl-[1.25em]"
            style={{ borderColor: 'rgba(17, 19, 24, 0.12)' }}
          >
            {side.map(renderSection)}
          </aside>
        </div>
      ) : (
        <div>{main.map(renderSection)}</div>
      )}
    </>
  )
}
