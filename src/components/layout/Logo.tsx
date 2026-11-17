import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function Logo({ className, to = '/' }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="Swalto home"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-[9px] bg-accent text-accent-fg shadow-sm">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden fill="none">
          <path
            d="M17.4 7.1c-.9-1.2-2.4-1.9-4.2-1.9-2.6 0-4.4 1.3-4.4 3.3 0 2.2 2 2.8 4.4 3.3 2.7.6 4.4 1.4 4.4 3.6 0 2.2-2 3.7-5 3.7-2.3 0-4.2-.8-5.1-2.3"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Swalto</span>
    </Link>
  )
}
