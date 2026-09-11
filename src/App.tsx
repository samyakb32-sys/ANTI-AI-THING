import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Landing from './pages/Landing'
import Humanize from './pages/Humanize'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            <Header />
            <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="humanize" element={<Humanize />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  )
}
