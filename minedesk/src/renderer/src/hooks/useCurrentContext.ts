import { useState, useEffect } from 'react'

interface CurrentContext {
  app: string
  window: string
  timestamp: number
  recentText?: string
}

export function useCurrentContext() {
  const [context, setContext] = useState<CurrentContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContext() {
      try {
        const data = await window.api.screenpipe.getCurrentContext?.()
        setContext(data)
        setError(null)
      } catch (err: any) {
        console.warn('Failed to fetch current context:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContext()

    // Update every 10 seconds
    const interval = setInterval(fetchContext, 10000)

    return () => clearInterval(interval)
  }, [])

  return { context, loading, error }
}

