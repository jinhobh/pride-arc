import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MonthPage from './pages/MonthPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/month/:id" element={<MonthPage />} />
      </Routes>
    </BrowserRouter>
  )
}
