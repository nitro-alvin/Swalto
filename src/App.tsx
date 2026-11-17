import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from './components/theme'
import { ToastProvider } from './components/toast'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import AtsPage from './pages/AtsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App(): ReactNode {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="app-root min-h-screen bg-bg text-fg">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/editor/:id" element={<EditorPage />} />
            <Route path="/ats" element={<AtsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
