import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MonthPage from './pages/MonthPage'
import PlanPage from './pages/PlanPage'
import StatsPage from './pages/StatsPage'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/plan"      element={<PlanPage />} />
        <Route path="/stats"     element={<StatsPage />} />
        <Route path="/month/:id" element={<MonthPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
