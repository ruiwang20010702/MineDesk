import { useState, useEffect } from 'react'

interface ServiceStatus {
  available: boolean
  url: string
}

export function useServicesStatus() {
  const [screenpipeStatus, setScreenpipeStatus] = useState<ServiceStatus>({
    available: false,
    url: ''
  })
  const [minecontextStatus, setMinecontextStatus] = useState<ServiceStatus>({
    available: false,
    url: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkServices() {
      try {
        // Check both services in parallel for faster loading
        const [screenpipe, minecontext] = await Promise.allSettled([
          window.api.screenpipe.getStatus(),
          window.api.minecontext.getStatus()
        ])

        if (screenpipe.status === 'fulfilled') {
          setScreenpipeStatus(screenpipe.value)
        } else {
          setScreenpipeStatus({ available: false, url: 'http://localhost:3030' })
        }

        if (minecontext.status === 'fulfilled') {
          setMinecontextStatus(minecontext.value)
        } else {
          setMinecontextStatus({ available: false, url: 'http://localhost:8000' })
        }
      } catch (error) {
        console.error('Failed to check services status:', error)
      } finally {
        setLoading(false)
      }
    }

    // Show loading screen for minimum 1 second for better UX
    const minLoadTime = setTimeout(() => {
      checkServices()
    }, 1000)

    // Recheck every 30 seconds
    const interval = setInterval(checkServices, 30000)

    return () => {
      clearTimeout(minLoadTime)
      clearInterval(interval)
    }
  }, [])

  return {
    screenpipeStatus,
    minecontextStatus,
    loading
  }
}

