import axios, { AxiosInstance } from 'axios'

interface ScreenpipeSearchOptions {
  content_type?: 'ocr' | 'audio' | 'all'
  limit?: number
  offset?: number
  start_time?: number
  end_time?: number
  app_name?: string
}

interface ScreenpipeActivity {
  timestamp: number
  app_name: string
  window_title: string
  text_content?: string
  image_path?: string
}

class ScreenpipeService {
  private client: AxiosInstance
  private baseUrl: string
  private isAvailable: boolean = false

  constructor(baseUrl: string = 'http://localhost:3030') {
    this.baseUrl = baseUrl
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Check availability on initialization
    this.checkAvailability()
  }

  /**
   * Check if Screenpipe service is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      this.isAvailable = response.status === 200
      console.log('✅ Screenpipe service is available')
      return true
    } catch (error) {
      this.isAvailable = false
      console.warn('⚠️  Screenpipe service is not available:', error)
      return false
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{ available: boolean; url: string }> {
    await this.checkAvailability()
    return {
      available: this.isAvailable,
      url: this.baseUrl
    }
  }

  /**
   * Search screen content and audio transcripts
   */
  async search(query: string, options: ScreenpipeSearchOptions = {}): Promise<any> {
    if (!this.isAvailable) {
      throw new Error('Screenpipe service is not available')
    }

    try {
      const response = await this.client.post('/search', {
        q: query,
        content_type: options.content_type || 'all',
        limit: options.limit || 50,
        offset: options.offset || 0,
        start_time: options.start_time,
        end_time: options.end_time,
        app_name: options.app_name
      })

      return response.data
    } catch (error: any) {
      console.error('Screenpipe search error:', error)
      throw new Error(`Failed to search: ${error.message}`)
    }
  }

  /**
   * Get activities within a time range
   */
  async getActivities(
    startTime?: number,
    endTime?: number
  ): Promise<ScreenpipeActivity[]> {
    if (!this.isAvailable) {
      throw new Error('Screenpipe service is not available')
    }

    try {
      const now = Date.now()
      const start = startTime || now - 24 * 60 * 60 * 1000 // Default: last 24 hours
      const end = endTime || now

      const response = await this.client.get('/activities', {
        params: {
          start_time: start,
          end_time: end
        }
      })

      return response.data.activities || []
    } catch (error: any) {
      console.error('Screenpipe get activities error:', error)
      throw new Error(`Failed to get activities: ${error.message}`)
    }
  }

  /**
   * Get current context (most recent activity)
   */
  async getCurrentContext(): Promise<{
    app: string
    window: string
    timestamp: number
    recentText?: string
  }> {
    if (!this.isAvailable) {
      throw new Error('Screenpipe service is not available')
    }

    try {
      const activities = await this.getActivities(
        Date.now() - 5 * 60 * 1000, // Last 5 minutes
        Date.now()
      )

      if (activities.length === 0) {
        return {
          app: 'Unknown',
          window: 'Unknown',
          timestamp: Date.now()
        }
      }

      const latest = activities[activities.length - 1]
      return {
        app: latest.app_name,
        window: latest.window_title,
        timestamp: latest.timestamp,
        recentText: latest.text_content
      }
    } catch (error: any) {
      console.error('Get current context error:', error)
      throw new Error(`Failed to get current context: ${error.message}`)
    }
  }

  /**
   * Get screen activity summary for a time period
   */
  async getActivitySummary(
    startTime: number,
    endTime: number
  ): Promise<{
    totalTime: number
    apps: { name: string; duration: number }[]
    topWindows: { title: string; count: number }[]
  }> {
    const activities = await this.getActivities(startTime, endTime)

    // Calculate app usage time
    const appUsage = new Map<string, number>()
    const windowCounts = new Map<string, number>()

    activities.forEach((activity) => {
      appUsage.set(activity.app_name, (appUsage.get(activity.app_name) || 0) + 1)
      windowCounts.set(
        activity.window_title,
        (windowCounts.get(activity.window_title) || 0) + 1
      )
    })

    return {
      totalTime: endTime - startTime,
      apps: Array.from(appUsage.entries())
        .map(([name, duration]) => ({ name, duration }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      topWindows: Array.from(windowCounts.entries())
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  }
}

// Singleton instance
export const screenpipeService = new ScreenpipeService()
export default screenpipeService

