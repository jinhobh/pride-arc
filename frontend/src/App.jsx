import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MonthPage from './pages/MonthPage'
import PlanPage from './pages/PlanPage'
import StatsPage from './pages/StatsPage'
import BottomNav from './components/BottomNav'

function getSceneImage() {
  const now   = new Date()
  const hour  = now.getHours()
  const month = now.getMonth() // 0=Jan … 11=Dec

  if (hour >= 20 || hour < 5)  return '/scene_night.png'
  if (hour >= 17)               return '/scene_sunset.png'

  // Daytime — pick by season
  if (month === 11 || month <= 1) return '/scene_snowy.png'   // Dec–Feb
  if (month <= 4)                 return '/scene_blossom.png' // Mar–May
  return '/scene_sunny.png'                                    // Jun–Nov
}

function WorldBackground() {
  const [scene, setScene] = useState(getSceneImage)

  // Re-evaluate every minute so the scene transitions as time passes
  useEffect(() => {
    const id = setInterval(() => setScene(getSceneImage()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* Scene image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${scene}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          transition: 'background-image 1.5s ease',
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
