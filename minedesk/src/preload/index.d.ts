import { ElectronAPI } from '@electron-toolkit/preload'

// Database types
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  conversationId: string
  sources?: string[]
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

export interface ConversationStats {
  totalConversations: number
  totalMessages: number
  avgMessagesPerConversation: number
  lastConversationDate: number | null
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      screenpipe: {
        search: (query: string, options?: any) => Promise<any>
        getActivities: (startTime?: number, endTime?: number) => Promise<any>
        getStatus: () => Promise<any>
        getCurrentContext: () => Promise<any>
        getActivitySummary: (startTime: number, endTime: number) => Promise<any>
      }
      minecontext: {
        search: (query: string, options?: any) => Promise<any>
        chat: (messages: any[], options?: any) => Promise<any>
        getStatus: () => Promise<any>
        getContext: (query: string, topK?: number) => Promise<any>
        getStats: () => Promise<any>
      }
      database: {
        createConversation: (id: string, title?: string) => Promise<Conversation>
        saveMessage: (message: Message) => Promise<{ success: boolean }>
        saveMessages: (messages: Message[]) => Promise<{ success: boolean }>
        getMessages: (conversationId: string, limit?: number) => Promise<Message[]>
        getConversations: (limit?: number) => Promise<Conversation[]>
        getConversation: (id: string) => Promise<Conversation | null>
        updateConversationTitle: (id: string, title: string) => Promise<{ success: boolean }>
        deleteConversation: (id: string) => Promise<{ success: boolean }>
        searchMessages: (query: string, limit?: number) => Promise<Message[]>
        getStats: () => Promise<ConversationStats>
      }
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        hide: () => void
      }
    }
  }
}

