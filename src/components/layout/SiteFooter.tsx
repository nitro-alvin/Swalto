import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A free resume builder for students, freshers and professionals. Your resume stays in
              your browser — no account, no upload, no subscription.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-fg uppercase">Product</h3>
              <ul className="space-y-2 text-muted">
                <li>
                  <a href="#features" className="hover:text-fg">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-fg">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-fg">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/ats" className="hover:text-fg">
                    ATS checker
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-fg uppercase">Build</h3>
              <ul className="space-y-2 text-muted">
                <li>
                  <Link to="/dashboard" className="hover:text-fg">
                    My resumes
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-fg">
                    Import data
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-fg">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-fg uppercase">Good to know</h3>
              <ul className="space-y-2 text-muted">
                <li>PDF export included</li>
                <li>Works offline</li>
                <li>No account required</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Swalto. Built for people who need a resume, not a subscription.</p>
          <p>
            ATS scores are guidance only — no tool can guarantee an interview. Your data never leaves this
            device.
          </p>
        </div>
      </div>
    </footer>
  )
}
