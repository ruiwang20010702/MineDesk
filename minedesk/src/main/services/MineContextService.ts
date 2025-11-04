import axios, { AxiosInstance } from 'axios'

interface MineContextSearchOptions {
  top_k?: number
  score_threshold?: number
  context_type?: string
}

interface MineContextChatOptions {
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

interface SearchResult {
  content: string
  source: string
  score: number
  metadata?: any
}

class MineContextService {
  private client: AxiosInstance
  private baseUrl: string
  private isAvailable: boolean = false

  constructor(baseUrl: string = 'http://localhost:17860') {
    this.baseUrl = baseUrl
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Check availability on initialization
    this.checkAvailability()
  }

  /**
   * Check if MineContext service is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health')
      this.isAvailable = response.status === 200
      console.log('✅ MineContext service is available')
      return true
    } catch (error) {
      this.isAvailable = false
      console.warn('⚠️  MineContext service is not available:', error)
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
   * Search documents using RAG
   */
  async search(query: string, options: MineContextSearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isAvailable) {
      throw new Error('MineContext service is not available')
    }

    try {
      const response = await this.client.post('/api/search', {
        query,
        top_k: options.top_k || 5,
        score_threshold: options.score_threshold || 0.5,
        context_type: options.context_type
      })

      return response.data.results || []
    } catch (error: any) {
      console.error('MineContext search error:', error)
      throw new Error(`Failed to search: ${error.message}`)
    }
  }

  /**
   * Chat with AI using RAG context
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    options: MineContextChatOptions = {}
  ): Promise<any> {
    if (!this.isAvailable) {
      throw new Error('MineContext service is not available')
    }

    try {
      const response = await this.client.post('/api/chat', {
        messages,
        stream: options.stream || false,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000
      })

      return response.data
    } catch (error: any) {
      console.error('MineContext chat error:', error)
      throw new Error(`Failed to chat: ${error.message}`)
    }
  }

  /**
   * Get relevant context for a query
   */
  async getContext(query: string, topK: number = 3): Promise<SearchResult[]> {
    return this.search(query, { top_k: topK, score_threshold: 0.6 })
  }

  /**
   * Index new documents
   */
  async indexDocuments(documents: Array<{ content: string; metadata?: any }>): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('MineContext service is not available')
    }

    try {
      await this.client.post('/api/index', { documents })
      console.log(`✅ Indexed ${documents.length} documents`)
    } catch (error: any) {
      console.error('MineContext index error:', error)
      throw new Error(`Failed to index documents: ${error.message}`)
    }
  }

  /**
   * Get context statistics
   */
  async getStats(): Promise<{
    totalDocuments: number
    totalChunks: number
    indexSize: number
  }> {
    if (!this.isAvailable) {
      return {
        totalDocuments: 0,
        totalChunks: 0,
        indexSize: 0
      }
    }

    try {
      const response = await this.client.get('/api/stats')
      return response.data
    } catch (error: any) {
      console.error('Get stats error:', error)
      return {
        totalDocuments: 0,
        totalChunks: 0,
        indexSize: 0
      }
    }
  }
}

// Singleton instance
export const minecontextService = new MineContextService()
export default minecontextService

