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
  const [activityFeed, setActivityFeed] = useState([])
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [streakStatus, setStreakStatus] = useState(null)
  const [currentTasks, setCurrentTasks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = todayISO()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stateRes, progressRes, habitsRes, activityRes, feedRes, weeklyRes, streakRes, tasksRes] = await Promise.all([
        fetch(`${BASE}/state`),
        fetch(`${BASE}/progress`),
        fetch(`${BASE}/habits/${today}`),
        fetch(`${BASE}/activity?days=180`),
        fetch(`${BASE}/activity-feed?limit=10`),
        fetch(`${BASE}/weekly-summary`),
        fetch(`${BASE}/streak-status`),
        fetch(`${BASE}/current-tasks`),
      ])
      if (!stateRes.ok) throw new Error(`State fetch failed: ${stateRes.status}`)
      if (!progressRes.ok) throw new Error(`Progress fetch failed: ${progressRes.status}`)

      const [stateData, progressData, habitsData, activityData, feedData, weeklyData, streakData, tasksData] = await Promise.all([
        stateRes.json(),
        progressRes.json(),
        habitsRes.ok ? habitsRes.json() : Promise.resolve([]),
        activityRes.ok ? activityRes.json() : Promise.resolve([]),
        feedRes.ok ? feedRes.json() : Promise.resolve([]),
        weeklyRes.ok ? weeklyRes.json() : Promise.resolve(null),
        streakRes.ok ? streakRes.json() : Promise.resolve(null),
        tasksRes.ok ? tasksRes.json() : Promise.resolve(null),
      ])

      setState(stateData)
      setProgress(progressData)
      setTodayHabits(Array.isArray(habitsData) ? habitsData : [])
      setActivity(Array.isArray(activityData) ? activityData : [])
      setActivityFeed(Array.isArray(feedData) ? feedData : [])
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
    activityFeed,
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

export function usePlanStudio() {
  const [studioData, setStudioData] = useState(null)
  const [pace, setPace] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStudioMonth = useCallback(async (month) => {
    setLoading(true)
    try {
      const [studioRes, paceRes] = await Promise.all([
        fetch(`${BASE}/plan/studio/${month}`),
        fetch(`${BASE}/plan/pace`),
      ])
      const [data, paceData] = await Promise.all([
        studioRes.ok ? studioRes.json() : null,
        paceRes.ok ? paceRes.json() : null,
      ])
      setStudioData(data)
      setPace(paceData)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTask = useCallback(async (taskId, updates) => {
    const res = await fetch(`${BASE}/plan/task/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return res.ok ? res.json() : null
  }, [])

  const createTask = useCallback(async (data) => {
    const res = await fetch(`${BASE}/plan/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok ? res.json() : null
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    const res = await fetch(`${BASE}/plan/task/${taskId}`, { method: 'DELETE' })
    return res.ok ? res.json() : null
  }, [])

  const restoreTask = useCallback(async (taskId) => {
    const res = await fetch(`${BASE}/plan/task/${taskId}/restore`, { method: 'POST' })
    return res.ok ? res.json() : null
  }, [])

  const updateCheckpoint = useCallback(async (cpId, updates) => {
    const res = await fetch(`${BASE}/plan/checkpoint/${cpId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return res.ok ? res.json() : null
  }, [])

  const createCheckpoint = useCallback(async (data) => {
    const res = await fetch(`${BASE}/plan/checkpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok ? res.json() : null
  }, [])

  const deleteCheckpoint = useCallback(async (cpId) => {
    const res = await fetch(`${BASE}/plan/checkpoint/${cpId}`, { method: 'DELETE' })
    return res.ok ? res.json() : null
  }, [])

  const updateHabit = useCallback(async (habitId, updates) => {
    const res = await fetch(`${BASE}/plan/habit/${habitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return res.ok ? res.json() : null
  }, [])

  const createHabit = useCallback(async (data) => {
    const res = await fetch(`${BASE}/plan/habit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok ? res.json() : null
  }, [])

  const deleteHabit = useCallback(async (habitId) => {
    const res = await fetch(`${BASE}/plan/habit/${habitId}`, { method: 'DELETE' })
    return res.ok ? res.json() : null
  }, [])

  return {
    studioData, pace, loading, error,
    fetchStudioMonth,
    updateTask, createTask, deleteTask, restoreTask,
    updateCheckpoint, createCheckpoint, deleteCheckpoint,
    updateHabit, createHabit, deleteHabit,
  }
}
