import type { Personal } from '../../types/resume'
import { Field, Input } from '../ui'

type PersonalKey = keyof Personal

const FIELDS: Array<{
  key: PersonalKey
  label: string
  placeholder: string
  type?: string
  half?: boolean
  hint?: string
}> = [
  { key: 'fullName', label: 'Full name', placeholder: 'Ananya Sharma', half: true },
  { key: 'title', label: 'Professional title', placeholder: 'Frontend Developer', half: true },
  { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email', half: true },
  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'tel', half: true },
  { key: 'location', label: 'Location', placeholder: 'Bengaluru, India', half: true },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username', half: true },
  { key: 'github', label: 'GitHub', placeholder: 'github.com/username', half: true },
  { key: 'website', label: 'Portfolio website', placeholder: 'yourname.dev', half: true },
]

export function PersonalFields({
  personal,
  onChange,
}: {
  personal: Personal
  onChange: (patch: Partial<Personal>) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELDS.map((field) => (
        <Field
          key={field.key}
          label={field.label}
          htmlFor={`personal-${field.key}`}
          className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}
          optional={field.key !== 'fullName' && field.key !== 'email'}
        >
          <Input
            id={`personal-${field.key}`}
            type={field.type ?? 'text'}
            value={personal[field.key]}
            placeholder={field.placeholder}
            autoComplete="off"
            onChange={(event) => onChange({ [field.key]: event.target.value })}
          />
        </Field>
      ))}
      <p className="col-span-2 text-[11px] leading-relaxed text-muted">
        Links appear as plain text on the resume so applicant tracking systems can read them.
      </p>
    </div>
  )
}
