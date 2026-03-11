import { useState, useEffect, useCallback } from 'react'

const BASE = '/api'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function useGameData() {
  const [state,       setState]       = useState(null)
  const [progress,    setProgress]    = useState(null)
  const [todayHabits, setTodayHabits] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const today = todayISO()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stateRes, progressRes, habitsRes] = await Promise.all([
        fetch(`${BASE}/state`),
        fetch(`${BASE}/progress`),
        fetch(`${BASE}/habits/${today}`),
      ])
      if (!stateRes.ok)    throw new Error(`State fetch failed: ${stateRes.status}`)
      if (!progressRes.ok) throw new Error(`Progress fetch failed: ${progressRes.status}`)

      const [stateData, progressData, habitsData] = await Promise.all([
        stateRes.json(),
        progressRes.json(),
        habitsRes.ok ? habitsRes.json() : Promise.resolve([]),
      ])

      setState(stateData)
      setProgress(progressData)
      setTodayHabits(Array.isArray(habitsData) ? habitsData : [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Actions ──────────────────────────────────────────────────────────────

  const checkin = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/checkin`, { method: 'POST' })
      if (res.ok) await fetchAll()
      return res.ok
    } catch {
      return false
    }
  }, [fetchAll])

  const logHabit = useCallback(async (habitId, completed) => {
    try {
      const res = await fetch(`${BASE}/habit/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date: today, completed }),
      })
      if (res.ok) await fetchAll()
      return res.ok
    } catch {
      return false
    }
  }, [today, fetchAll])

  const hasCheckedInToday = state?.last_checkin_date === today

  return {
    state,
    progress,
    todayHabits,
    loading,
    error,
    today,
    hasCheckedInToday,
    checkin,
    logHabit,
    refetch: fetchAll,
  }
}
