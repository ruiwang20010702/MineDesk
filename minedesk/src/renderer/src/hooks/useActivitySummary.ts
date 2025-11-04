import { useState, useEffect } from 'react'

interface ActivitySummary {
  totalTime: number
  apps: { name: string; duration: number }[]
  topWindows: { title: string; count: number }[]
}

export function useActivitySummary() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const now = Date.now()
        const startOfDay = new Date().setHours(0, 0, 0, 0)
        
        const data = await window.api.screenpipe.getActivitySummary?.(startOfDay, now)
        setSummary(data)
      } catch (err) {
        console.warn('Failed to fetch activity summary:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()

    // Update every 5 minutes
    const interval = setInterval(fetchSummary, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { summary, loading }
}

