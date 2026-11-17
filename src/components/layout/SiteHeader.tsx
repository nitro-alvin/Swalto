import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { ThemeToggle } from '../theme'
import { useToast } from '../toast'
import { resumeRepo } from '../../lib/db'
import { cn } from '../../lib/utils'

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const { push } = useToast()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function createResume() {
    setCreating(true)
    try {
      const record = await resumeRepo.create()
      navigate(`/editor/${record.id}`)
    } catch (error) {
      push(error instanceof Error ? error.message : 'Could not create a resume.', 'error')
      setCreating(false)
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-200',
        scrolled ? 'border-border bg-bg' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link to="/dashboard" className="btn btn-ghost btn-md">
            Dashboard
          </Link>
          <button type="button" onClick={createResume} className="btn btn-primary btn-md" disabled={creating}>
            Create my resume
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="btn btn-secondary h-9 w-9 rounded-lg p-0"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="animate-pop border-t border-border bg-bg px-5 pb-5 md:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-muted hover:bg-surface hover:text-fg"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm text-muted hover:bg-surface hover:text-fg"
            >
              Dashboard
            </Link>
          </nav>
          <button type="button" onClick={createResume} className="btn btn-primary btn-md mt-2 w-full" disabled={creating}>
            Create my resume
          </button>
        </div>
      )}
    </header>
  )
}
