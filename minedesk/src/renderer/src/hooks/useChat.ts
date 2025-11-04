import { useState, useEffect } from 'react'
import { useConversationHistory } from './useConversationHistory'
import { useToast } from '../components/ui/Toast'
import { ErrorCode, parseError, getUserFriendlyMessage } from '../utils/errorHandler'
import type { Message } from '../../../preload/index.d'

// 生成唯一的对话 ID
const CURRENT_CONVERSATION_ID = `conv-${Date.now()}`

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const toast = useToast()
  
  // 使用对话历史 Hook
  const {
    conversation,
    isLoading: isHistoryLoading,
    loadMessages,
    saveMessage,
    updateTitle
  } = useConversationHistory(CURRENT_CONVERSATION_ID)

  // 初始化：加载历史消息
  useEffect(() => {
    const initMessages = async () => {
      if (isHistoryLoading || isInitialized) return
      
      try {
        const history = await loadMessages(100)
        if (history.length > 0) {
          setMessages(history)
          console.log(`Loaded ${history.length} messages from history`)
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to load message history:', error)
        const appError = parseError(error)
        const friendlyMsg = getUserFriendlyMessage(appError)
        toast.error(friendlyMsg.title, friendlyMsg.message)
        setIsInitialized(true)
      }
    }
    
    initMessages()
  }, [isHistoryLoading, loadMessages, isInitialized])

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      conversationId: CURRENT_CONVERSATION_ID
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    
    // 立即保存用户消息到数据库
    try {
      await saveMessage(userMessage)
    } catch (error) {
      console.error('Failed to save user message:', error)
      toast.warning('消息保存失败', '您的消息可能无法恢复')
    }

    try {
      // Get context from Screenpipe
      let contextInfo = ''
      try {
        const context = await window.api.screenpipe.getCurrentContext?.()
        if (context) {
          contextInfo = `\nCurrent context: Working in ${context.app} - ${context.window}`
        }
      } catch (err) {
        console.warn('Failed to get Screenpipe context:', err)
      }

      // Prepare messages for API
      const apiMessages = messages
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content
        }))

      // Try MineContext first
      let response
      try {
        response = await window.api.minecontext.chat(apiMessages, {
          stream: false,
          temperature: 0.7,
          max_tokens: 2000
        })
      } catch (error) {
        console.warn('MineContext not available, using fallback response')
        toast.warning('AI 服务不可用', 'MineContext 服务未连接，使用简化响应')
        // Fallback response if MineContext is not available
        response = {
          content: `I received your message: "${content}"${contextInfo}\n\nNote: MineContext service is currently unavailable. Please ensure it's running to get AI-powered responses with context awareness.`
        }
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content || response.message || 'No response received',
        timestamp: Date.now(),
        conversationId: CURRENT_CONVERSATION_ID,
        sources: response.sources // RAG 引用来源
      }
      setMessages((prev) => [...prev, assistantMessage])
      
      // 保存 AI 响应到数据库
      try {
        await saveMessage(assistantMessage)
        
        // 自动更新对话标题（使用第一条用户消息）
        if (messages.length === 0 && conversation) {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
          await updateTitle(title)
        }
      } catch (error) {
        console.error('Failed to save assistant message:', error)
        // 静默失败，不显示 toast（不影响用户体验）
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      
      // 解析错误并显示友好提示
      const appError = parseError(error)
      const friendlyMsg = getUserFriendlyMessage(appError)
      toast.error(friendlyMsg.title, friendlyMsg.message)
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${friendlyMsg.message}. Please try again.`,
        timestamp: Date.now(),
        conversationId: CURRENT_CONVERSATION_ID
      }
      setMessages((prev) => [...prev, errorMessage])
      
      // 也保存错误消息
      try {
        await saveMessage(errorMessage)
      } catch (saveError) {
        console.error('Failed to save error message:', saveError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return {
    messages,
    isLoading: isLoading || !isInitialized,
    sendMessage,
    clearMessages,
    conversation
  }
}

