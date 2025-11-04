import { useState, useEffect, useCallback } from 'react'
import { Message, Conversation } from '../../../preload/index.d'

/**
 * useConversationHistory - 对话历史持久化 Hook
 * 自动保存和加载对话消息
 */
export function useConversationHistory(conversationId: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)

  // 初始化：加载或创建对话
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 尝试加载已存在的对话
        const existing = await window.api.database.getConversation(conversationId)
        
        if (existing) {
          setConversation(existing)
        } else {
          // 创建新对话
          const newConv = await window.api.database.createConversation(
            conversationId,
            '新对话'
          )
          setConversation(newConv)
        }
      } catch (err: any) {
        console.error('Failed to init conversation:', err)
        setError(err.message || '初始化对话失败')
      } finally {
        setIsLoading(false)
      }
    }

    initConversation()
  }, [conversationId])

  // 加载消息历史
  const loadMessages = useCallback(async (limit: number = 100): Promise<Message[]> => {
    try {
      const messages = await window.api.database.getMessages(conversationId, limit)
      return messages
    } catch (err: any) {
      console.error('Failed to load messages:', err)
      throw err
    }
  }, [conversationId])

  // 保存单条消息
  const saveMessage = useCallback(async (message: Omit<Message, 'conversationId'>) => {
    try {
      const fullMessage: Message = {
        ...message,
        conversationId
      }
      
      await window.api.database.saveMessage(fullMessage)
      
      // 更新对话信息
      const updated = await window.api.database.getConversation(conversationId)
      if (updated) {
        setConversation(updated)
      }
    } catch (err: any) {
      console.error('Failed to save message:', err)
      throw err
    }
  }, [conversationId])

  // 批量保存消息
  const saveMessages = useCallback(async (messages: Omit<Message, 'conversationId'>[]) => {
    try {
      const fullMessages: Message[] = messages.map(msg => ({
        ...msg,
        conversationId
      }))
      
      await window.api.database.saveMessages(fullMessages)
      
      // 更新对话信息
      const updated = await window.api.database.getConversation(conversationId)
      if (updated) {
        setConversation(updated)
      }
    } catch (err: any) {
      console.error('Failed to save messages:', err)
      throw err
    }
  }, [conversationId])

  // 更新对话标题
  const updateTitle = useCallback(async (title: string) => {
    try {
      await window.api.database.updateConversationTitle(conversationId, title)
      
      // 更新本地状态
      if (conversation) {
        setConversation({
          ...conversation,
          title,
          updatedAt: Date.now()
        })
      }
    } catch (err: any) {
      console.error('Failed to update title:', err)
      throw err
    }
  }, [conversationId, conversation])

  return {
    conversation,
    isLoading,
    error,
    loadMessages,
    saveMessage,
    saveMessages,
    updateTitle
  }
}

/**
 * useConversationList - 对话列表管理 Hook
 */
export function useConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载对话列表
  const loadConversations = useCallback(async (limit: number = 50) => {
    try {
      setIsLoading(true)
      setError(null)
      const list = await window.api.database.getConversations(limit)
      setConversations(list)
    } catch (err: any) {
      console.error('Failed to load conversations:', err)
      setError(err.message || '加载对话列表失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // 删除对话
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await window.api.database.deleteConversation(id)
      setConversations(prev => prev.filter(conv => conv.id !== id))
    } catch (err: any) {
      console.error('Failed to delete conversation:', err)
      throw err
    }
  }, [])

  // 刷新列表
  const refresh = useCallback(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    isLoading,
    error,
    deleteConversation,
    refresh
  }
}

/**
 * useMessageSearch - 消息搜索 Hook
 */
export function useMessageSearch() {
  const [results, setResults] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, limit: number = 50) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setIsSearching(true)
      setError(null)
      const messages = await window.api.database.searchMessages(query, limit)
      setResults(messages)
    } catch (err: any) {
      console.error('Failed to search messages:', err)
      setError(err.message || '搜索失败')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    isSearching,
    error,
    search,
    clearResults
  }
}

