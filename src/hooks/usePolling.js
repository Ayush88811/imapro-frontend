import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../utils/api'

export function usePolling() {
  const [dashboardData, setDashboardData] = useState({ batch: null, scheduledJobs: [] })
  const [isPollingActive, setIsPollingActive] = useState(false)
  const timerRef = useRef(null)
  const lastStateRef = useRef({ hasActiveBatch: false, hasScheduledJobs: false, hasRunningJobs: false })

  const stopPolling = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setIsPollingActive(false)
  }, [])

  const updateDashboard = useCallback(async () => {
    try {
      const res = await api.getDashboardData()
      if (res.success) setDashboardData(res.data)
    } catch {}
  }, [])

  const checkState = useCallback(async () => {
    try {
      const res = await api.getPollStatus()
      if (!res.success) return
      const { pollNeeded, pollInterval, hasActiveBatch, hasScheduledJobs, hasRunningScheduledJobs } = res.data
      const prev = lastStateRef.current
      const changed = prev.hasActiveBatch !== hasActiveBatch || prev.hasScheduledJobs !== hasScheduledJobs || prev.hasRunningJobs !== hasRunningScheduledJobs
      lastStateRef.current = { hasActiveBatch, hasScheduledJobs, hasRunningJobs: hasRunningScheduledJobs }
      if (pollNeeded) {
        if (changed || hasActiveBatch || hasRunningScheduledJobs) await updateDashboard()
        if (!timerRef.current || isPollingActive) {
          stopPolling()
          setIsPollingActive(true)
          timerRef.current = setInterval(checkState, pollInterval || 30000)
        }
      } else {
        stopPolling()
        setDashboardData({ batch: null, scheduledJobs: [] })
      }
    } catch {}
  }, [updateDashboard, stopPolling, isPollingActive])

  const triggerCheck = useCallback(() => { checkState() }, [checkState])

  useEffect(() => {
    checkState()
    return () => stopPolling()
  }, [])

  return { dashboardData, isPollingActive, triggerCheck, updateDashboard }
}
