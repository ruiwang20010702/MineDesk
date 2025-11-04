/**
 * CrewAI Service Integration for MineDesk
 * 
 * Handles communication with the CrewAI FastAPI service for
 * automated weekly report generation.
 */

import axios, { AxiosInstance } from 'axios'

/**
 * Options for report generation
 */
export interface ReportOptions {
  language?: 'zh' | 'en'
  include_activities?: boolean
  include_documents?: boolean
  include_conversations?: boolean
  template?: 'default' | 'detailed' | 'simple'
}

/**
 * Request for generating a weekly report
 */
export interface GenerateReportRequest {
  start_date: string  // ISO 8601 format
  end_date: string
  options?: ReportOptions
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  generated_at: string
  duration_seconds: number
  word_count: number
  sections: string[]
  language: string
  date_range: string
}

/**
 * Report statistics
 */
export interface ReportStatistics {
  total_activities: number
  total_documents: number
  total_time_hours: number
  productivity_score: number
}

/**
 * Response from report generation
 */
export interface GenerateReportResponse {
  status: 'success' | 'error'
  data?: {
    report_id: string
    content: string
    metadata: ReportMetadata
    statistics: ReportStatistics
  }
  message?: string
  error?: {
    code: string
    detail: string
    timestamp: string
  }
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string
  version: string
  services: {
    screenpipe?: { available: boolean; url: string; response_time_ms?: number }
    minecontext?: { available: boolean; url: string; response_time_ms?: number }
    llm?: { available: boolean; provider: string; model: string }
  }
  uptime_seconds: number
}

/**
 * CrewAI Service Client
 */
class CrewAIService {
  private client: AxiosInstance
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:18000') {
    this.baseUrl = baseUrl
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 120000,  // 2 minutes - report generation can take time
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Check if CrewAI service is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health')
      return response.status === 200
    } catch {
      return false
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    available: boolean
    url: string
    health?: HealthResponse
  }> {
    try {
      const response = await this.client.get<HealthResponse>('/api/health')
      return {
        available: true,
        url: this.baseUrl,
        health: response.data
      }
    } catch (error) {
      return {
        available: false,
        url: this.baseUrl
      }
    }
  }

  /**
   * Generate weekly report
   */
  async generateReport(
    request: GenerateReportRequest
  ): Promise<GenerateReportResponse> {
    try {
      const response = await this.client.post<GenerateReportResponse>(
        '/api/weekly-report/generate',
        request
      )
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      
      throw new Error(`CrewAI API error: ${error.message}`)
    }
  }

  /**
   * Get last 7 days date range
   */
  getLast7DaysRange(): { start_date: string; end_date: string } {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 7)
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    }
  }

  /**
   * Get current week date range (Monday to Sunday)
   */
  getCurrentWeekRange(): { start_date: string; end_date: string } {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return {
      start_date: monday.toISOString().split('T')[0],
      end_date: sunday.toISOString().split('T')[0]
    }
  }
}

// Export singleton instance
export default new CrewAIService()

