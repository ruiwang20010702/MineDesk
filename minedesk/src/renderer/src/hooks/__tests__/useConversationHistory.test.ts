import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useConversationHistory, useConversationList, useMessageSearch } from '../useConversationHistory'
import type { Message, Conversation } from '../../../../preload/index.d'
import React from 'react'

// Mock window.api
const mockApi = {
  database: {
    createConversation: vi.fn(),
    getConversation: vi.fn(),
    getMessages: vi.fn(),
    saveMessage: vi.fn(),
    saveMessages: vi.fn(),
    updateConversationTitle: vi.fn(),
    getConversations: vi.fn(),
    deleteConversation: vi.fn(),
    searchMessages: vi.fn()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  // @ts-ignore
  global.window = { api: mockApi }
})

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => children


describe('useConversationHistory', () => {
  const testConversation: Conversation = {
    id: 'conv-1',
    title: 'Test Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messageCount: 0
  }

  it('应该初始化并加载已存在的对话', async () => {
    mockApi.database.getConversation.mockResolvedValue(testConversation)
    mockApi.database.getMessages.mockResolvedValue([])

    const { result } = renderHook(() => useConversationHistory('conv-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversation).toEqual(testConversation)
    expect(result.current.error).toBeNull()
  })

  it('应该创建新对话如果不存在', async () => {
    mockApi.database.getConversation.mockResolvedValue(null)
    mockApi.database.createConversation.mockResolvedValue(testConversation)
    mockApi.database.getMessages.mockResolvedValue([])

    const { result } = renderHook(() => useConversationHistory('new-conv'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockApi.database.createConversation).toHaveBeenCalledWith('new-conv', '新对话')
    expect(result.current.conversation).toEqual(testConversation)
  })

  it('应该加载消息历史', async () => {
    mockApi.database.getConversation.mockResolvedValue(testConversation)
    const messages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now()
      }
    ]
    mockApi.database.getMessages.mockResolvedValue(messages)

    const { result } = renderHook(() => useConversationHistory('conv-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const loadedMessages = await result.current.loadMessages(100)
    expect(loadedMessages).toEqual(messages)
    expect(mockApi.database.getMessages).toHaveBeenCalledWith('conv-1', 100)
  })

  it('应该保存单条消息', async () => {
    mockApi.database.getConversation.mockResolvedValue(testConversation)
    mockApi.database.getMessages.mockResolvedValue([])
    mockApi.database.saveMessage.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useConversationHistory('conv-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const message = {
      id: 'msg-1',
      role: 'user' as const,
      content: 'Test message',
      timestamp: Date.now()
    }

    await result.current.saveMessage(message)

    expect(mockApi.database.saveMessage).toHaveBeenCalledWith({
      ...message,
      conversationId: 'conv-1'
    })
  })

  it('应该批量保存消息', async () => {
    mockApi.database.getConversation.mockResolvedValue(testConversation)
    mockApi.database.getMessages.mockResolvedValue([])
    mockApi.database.saveMessages.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useConversationHistory('conv-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const messages = [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Message 1',
        timestamp: Date.now()
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'Message 2',
        timestamp: Date.now()
      }
    ]

    await result.current.saveMessages(messages)

    expect(mockApi.database.saveMessages).toHaveBeenCalled()
  })

  it('应该更新对话标题', async () => {
    mockApi.database.getConversation.mockResolvedValue(testConversation)
    mockApi.database.getMessages.mockResolvedValue([])
    mockApi.database.updateConversationTitle.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useConversationHistory('conv-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.updateTitle('New Title')

    expect(mockApi.database.updateConversationTitle).toHaveBeenCalledWith('conv-1', 'New Title')
  })

  it('应该处理错误', async () => {
    mockApi.database.getConversation.mockRejectedValue(new Error('Database error'))
    mockApi.database.getMessages.mockResolvedValue([])

    const { result } = renderHook(() => useConversationHistory('conv-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })
})

describe('useConversationList', () => {
  const testConversations: Conversation[] = [
    {
      id: 'conv-1',
      title: 'Conversation 1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 5
    },
    {
      id: 'conv-2',
      title: 'Conversation 2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 3
    }
  ]

  it('应该加载对话列表', async () => {
    mockApi.database.getConversations.mockResolvedValue(testConversations)

    const { result } = renderHook(() => useConversationList(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversations).toEqual(testConversations)
    expect(result.current.error).toBeNull()
  })

  it('应该删除对话', async () => {
    mockApi.database.getConversations.mockResolvedValue(testConversations)
    mockApi.database.deleteConversation.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useConversationList(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.deleteConversation('conv-1')

    expect(mockApi.database.deleteConversation).toHaveBeenCalledWith('conv-1')
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('conv-2')
  })

  it('应该刷新对话列表', async () => {
    mockApi.database.getConversations.mockResolvedValue(testConversations)

    const { result } = renderHook(() => useConversationList(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const updatedConversations = [...testConversations, {
      id: 'conv-3',
      title: 'Conversation 3',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 1
    }]

    mockApi.database.getConversations.mockResolvedValue(updatedConversations)

    result.current.refresh()

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(3)
    })
  })
})

describe('useMessageSearch', () => {
  const searchResults: Message[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'TypeScript question',
      timestamp: Date.now()
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'TypeScript answer',
      timestamp: Date.now()
    }
  ]

  it('应该搜索消息', async () => {
    mockApi.database.searchMessages.mockResolvedValue(searchResults)

    const { result } = renderHook(() => useMessageSearch(), { wrapper })

    await result.current.search('TypeScript')

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })

    expect(result.current.results).toEqual(searchResults)
    expect(mockApi.database.searchMessages).toHaveBeenCalledWith('TypeScript', 50)
  })

  it('应该清空搜索结果', async () => {
    mockApi.database.searchMessages.mockResolvedValue(searchResults)

    const { result } = renderHook(() => useMessageSearch(), { wrapper })

    await result.current.search('TypeScript')

    await waitFor(() => {
      expect(result.current.results).toHaveLength(2)
    })

    result.current.clearResults()

    expect(result.current.results).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })

  it('空查询应该清空结果', async () => {
    const { result } = renderHook(() => useMessageSearch(), { wrapper })

    await result.current.search('')

    expect(result.current.results).toHaveLength(0)
    expect(mockApi.database.searchMessages).not.toHaveBeenCalled()
  })

  it('应该处理搜索错误', async () => {
    mockApi.database.searchMessages.mockRejectedValue(new Error('Search failed'))

    const { result } = renderHook(() => useMessageSearch(), { wrapper })

    await result.current.search('test')

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.results).toHaveLength(0)
  })
})

