import { useState, useEffect, useCallback } from 'react'

const BASE = '/api'

function todayISO() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useGameData() {
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(null)
  const [todayHabits, setTodayHabits] = useState([])
  const [activity, setActivity] = useState([])
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [streakStatus, setStreakStatus] = useState(null)
  const [currentTasks, setCurrentTasks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = todayISO()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stateRes, progressRes, habitsRes, activityRes, weeklyRes, streakRes, tasksRes] = await Promise.all([
        fetch(`${BASE}/state`),
        fetch(`${BASE}/progress`),
        fetch(`${BASE}/habits/${today}`),
        fetch(`${BASE}/activity?days=180`),
        fetch(`${BASE}/weekly-summary`),
        fetch(`${BASE}/streak-status`),
        fetch(`${BASE}/current-tasks`),
      ])
      if (!stateRes.ok) throw new Error(`State fetch failed: ${stateRes.status}`)
      if (!progressRes.ok) throw new Error(`Progress fetch failed: ${progressRes.status}`)

      const [stateData, progressData, habitsData, activityData, weeklyData, streakData, tasksData] = await Promise.all([
        stateRes.json(),
        progressRes.json(),
        habitsRes.ok ? habitsRes.json() : Promise.resolve([]),
        activityRes.ok ? activityRes.json() : Promise.resolve([]),
        weeklyRes.ok ? weeklyRes.json() : Promise.resolve(null),
        streakRes.ok ? streakRes.json() : Promise.resolve(null),
        tasksRes.ok ? tasksRes.json() : Promise.resolve(null),
      ])

      setState(stateData)
      setProgress(progressData)
      setTodayHabits(Array.isArray(habitsData) ? habitsData : [])
      setActivity(Array.isArray(activityData) ? activityData : [])
      setWeeklySummary(weeklyData)
      setStreakStatus(streakData)
      setCurrentTasks(tasksData)
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

  const logHabit = useCallback(async (habitId, completed, count = 1) => {
    try {
      const res = await fetch(`${BASE}/habit/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date: today, completed, count }),
      })
      if (res.ok) await fetchAll()
      return res.ok
    } catch {
      return false
    }
  }, [today, fetchAll])

  const hasCheckedInToday = streakStatus?.checked_in_today ?? (state?.last_checkin_date === today)

  return {
    state,
    progress,
    todayHabits,
    activity,
    weeklySummary,
    streakStatus,
    currentTasks,
    loading,
    error,
    today,
    hasCheckedInToday,
    checkin,
    logHabit,
    refetch: fetchAll,
  }
}

export function useMonthData() {
  const [completedTaskIds, setCompletedTaskIds] = useState([])
  const [completedCpIds, setCompletedCpIds] = useState([])
  const [recentCompletions, setRecentCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stateRes, recentRes] = await Promise.all([
        fetch(`${BASE}/state`),
        fetch(`${BASE}/completions/recent?days=7`),
      ])
      if (!stateRes.ok) throw new Error(`State fetch failed: ${stateRes.status}`)

      const [stateData, recentData] = await Promise.all([
        stateRes.json(),
        recentRes.ok ? recentRes.json() : Promise.resolve([]),
      ])

      setCompletedTaskIds(stateData.completed_task_ids ?? [])
      setCompletedCpIds(stateData.completed_checkpoint_ids ?? [])
      setRecentCompletions(Array.isArray(recentData) ? recentData : [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const completeTask = useCallback(async (taskId) => {
    try {
      const res = await fetch(`${BASE}/task/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      })
      if (res.ok) await fetchAll()
      return res.ok
    } catch { return false }
  }, [fetchAll])

  const uncompleteTask = useCallback(async (taskId) => {
    try {
      const res = await fetch(`${BASE}/task/uncomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      })
      if (res.ok) await fetchAll()
      return res.ok
    } catch { return false }
  }, [fetchAll])

  const completeCheckpoint = useCallback(async (checkpointId) => {
    try {
      const res = await fetch(`${BASE}/checkpoint/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpoint_id: checkpointId }),
      })
      if (res.ok) await fetchAll()
      return res.ok
    } catch { return false }
  }, [fetchAll])

  return {
    completedTaskIds,
    completedCpIds,
    recentCompletions,
    loading,
    error,
    completeTask,
    uncompleteTask,
    completeCheckpoint,
    refetch: fetchAll,
  }
}
