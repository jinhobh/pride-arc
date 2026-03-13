import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MonthPage from './pages/MonthPage'
import PlanPage from './pages/PlanPage'
import StatsPage from './pages/StatsPage'
import BottomNav from './components/BottomNav'

function WorldBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* Scene image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/scene.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      />
      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(10,22,40,0.15) 0%, transparent 30%, transparent 60%, rgba(10,22,40,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <WorldBackground />

      {/* Scrollable page content — sits between fixed header (56px) and nav (64px) */}
      <div
        style={{
          position: 'fixed',
          top: '56px',
          bottom: '64px',
          left: 0,
          right: 0,
          zIndex: 10,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/plan"      element={<PlanPage />} />
          <Route path="/stats"     element={<StatsPage />} />
          <Route path="/month/:id" element={<MonthPage />} />
        </Routes>
      </div>

      <BottomNav />
    </BrowserRouter>
  )
}
