import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseService } from '../DatabaseService'
import type { Message } from '../DatabaseService'
import fs from 'fs'
import path from 'path'
import os from 'os'

describe('DatabaseService', () => {
  let dbService: DatabaseService
  let tempDir: string

  beforeEach(() => {
    // 创建临时测试目录
    tempDir = path.join(os.tmpdir(), `minedesk-test-${Date.now()}`)
    fs.mkdirSync(tempDir, { recursive: true })

    // 使用内存数据库进行测试
    dbService = new DatabaseService(':memory:')
    dbService.initialize()
  })

  afterEach(() => {
    try {
      dbService.close()
      // 清理临时目录
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    } catch (error) {
      // 忽略清理错误
    }
  })

  describe('初始化', () => {
    it('应该成功初始化数据库', () => {
      expect(dbService).toBeDefined()
    })

    it('应该创建必要的表', () => {
      // 测试通过创建对话来验证表是否存在
      const conv = dbService.createConversation('test-id', 'Test Conversation')
      expect(conv.id).toBe('test-id')
    })
  })

  describe('对话管理', () => {
    it('应该创建新对话', () => {
      const conv = dbService.createConversation('conv-1', 'My Conversation')
      
      expect(conv.id).toBe('conv-1')
      expect(conv.title).toBe('My Conversation')
      expect(conv.messageCount).toBe(0)
      expect(conv.createdAt).toBeLessThanOrEqual(Date.now())
    })

    it('应该获取单个对话', () => {
      dbService.createConversation('conv-2', 'Test Conv')
      const conv = dbService.getConversation('conv-2')
      
      expect(conv).not.toBeNull()
      expect(conv?.title).toBe('Test Conv')
    })

    it('应该获取对话列表', () => {
      dbService.createConversation('conv-3', 'Conv 1')
      dbService.createConversation('conv-4', 'Conv 2')
      dbService.createConversation('conv-5', 'Conv 3')
      
      const conversations = dbService.getConversations(10)
      
      expect(conversations.length).toBe(3)
      expect(conversations[0].id).toBe('conv-5') // 最新的在前
    })

    it('应该更新对话标题', () => {
      dbService.createConversation('conv-6', 'Original Title')
      dbService.updateConversationTitle('conv-6', 'Updated Title')
      
      const conv = dbService.getConversation('conv-6')
      expect(conv?.title).toBe('Updated Title')
    })

    it('应该删除对话', () => {
      dbService.createConversation('conv-7', 'To Delete')
      dbService.deleteConversation('conv-7')
      
      const conv = dbService.getConversation('conv-7')
      expect(conv).toBeNull()
    })
  })

  describe('消息管理', () => {
    beforeEach(() => {
      dbService.createConversation('test-conv', 'Test Conversation')
    })

    it('应该保存单条消息', () => {
      const message: Message = {
        id: 'msg-1',
        conversationId: 'test-conv',
        role: 'user',
        content: 'Hello, world!',
        timestamp: Date.now()
      }
      
      dbService.saveMessage(message)
      const messages = dbService.getMessages('test-conv')
      
      expect(messages.length).toBe(1)
      expect(messages[0].content).toBe('Hello, world!')
    })

    it('应该批量保存消息', () => {
      const messages: Message[] = [
        {
          id: 'msg-2',
          conversationId: 'test-conv',
          role: 'user',
          content: 'Message 1',
          timestamp: Date.now()
        },
        {
          id: 'msg-3',
          conversationId: 'test-conv',
          role: 'assistant',
          content: 'Message 2',
          timestamp: Date.now() + 1000
        }
      ]
      
      dbService.saveMessages(messages)
      const retrieved = dbService.getMessages('test-conv')
      
      expect(retrieved.length).toBe(2)
    })

    it('应该获取消息并按时间排序', () => {
      const messages: Message[] = [
        {
          id: 'msg-4',
          conversationId: 'test-conv',
          role: 'user',
          content: 'First',
          timestamp: 1000
        },
        {
          id: 'msg-5',
          conversationId: 'test-conv',
          role: 'user',
          content: 'Second',
          timestamp: 2000
        }
      ]
      
      dbService.saveMessages(messages)
      const retrieved = dbService.getMessages('test-conv')
      
      expect(retrieved[0].content).toBe('First')
      expect(retrieved[1].content).toBe('Second')
    })

    it('应该限制返回的消息数量', () => {
      const messages: Message[] = Array.from({ length: 10 }, (_, i) => ({
        id: `msg-${i}`,
        conversationId: 'test-conv',
        role: 'user',
        content: `Message ${i}`,
        timestamp: Date.now() + i
      }))
      
      dbService.saveMessages(messages)
      const retrieved = dbService.getMessages('test-conv', 5)
      
      expect(retrieved.length).toBe(5)
    })

    it('应该保存和检索消息来源', () => {
      const message: Message = {
        id: 'msg-6',
        conversationId: 'test-conv',
        role: 'assistant',
        content: 'Answer with sources',
        timestamp: Date.now(),
        sources: ['doc1.pdf', 'doc2.txt']
      }
      
      dbService.saveMessage(message)
      const retrieved = dbService.getMessages('test-conv')
      
      expect(retrieved[0].sources).toEqual(['doc1.pdf', 'doc2.txt'])
    })

    it('应该更新对话的消息计数', () => {
      const message: Message = {
        id: 'msg-7',
        conversationId: 'test-conv',
        role: 'user',
        content: 'Test message',
        timestamp: Date.now()
      }
      
      dbService.saveMessage(message)
      const conv = dbService.getConversation('test-conv')
      
      expect(conv?.messageCount).toBe(1)
    })
  })

  describe('搜索功能', () => {
    beforeEach(() => {
      dbService.createConversation('search-conv', 'Search Test')
      
      const messages: Message[] = [
        {
          id: 'search-1',
          conversationId: 'search-conv',
          role: 'user',
          content: 'How to use TypeScript?',
          timestamp: Date.now()
        },
        {
          id: 'search-2',
          conversationId: 'search-conv',
          role: 'assistant',
          content: 'TypeScript is a typed superset of JavaScript.',
          timestamp: Date.now() + 1000
        },
        {
          id: 'search-3',
          conversationId: 'search-conv',
          role: 'user',
          content: 'What about React?',
          timestamp: Date.now() + 2000
        }
      ]
      
      dbService.saveMessages(messages)
    })

    it('应该搜索消息内容', () => {
      const results = dbService.searchMessages('TypeScript')
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(m => m.content.includes('TypeScript'))).toBe(true)
    })

    it('应该对搜索不区分大小写', () => {
      const results = dbService.searchMessages('typescript')
      
      expect(results.length).toBeGreaterThan(0)
    })

    it('空查询应该返回空结果', () => {
      const results = dbService.searchMessages('NonexistentQuery123')
      
      expect(results.length).toBe(0)
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的统计数据', () => {
      dbService.createConversation('stats-1', 'Conv 1')
      dbService.createConversation('stats-2', 'Conv 2')
      
      const messages: Message[] = [
        {
          id: 'stat-msg-1',
          conversationId: 'stats-1',
          role: 'user',
          content: 'Message 1',
          timestamp: Date.now()
        },
        {
          id: 'stat-msg-2',
          conversationId: 'stats-1',
          role: 'assistant',
          content: 'Message 2',
          timestamp: Date.now()
        }
      ]
      
      dbService.saveMessages(messages)
      
      const stats = dbService.getStats()
      
      expect(stats.totalConversations).toBe(2)
      expect(stats.totalMessages).toBe(2)
      expect(stats.lastConversationDate).toBeGreaterThan(0)
    })

    it('空数据库应该返回零统计', () => {
      const stats = dbService.getStats()
      
      expect(stats.totalConversations).toBe(0)
      expect(stats.totalMessages).toBe(0)
      expect(stats.avgMessagesPerConversation).toBe(0)
      expect(stats.lastConversationDate).toBeNull()
    })
  })

  describe('数据清理', () => {
    it('应该清空所有数据', () => {
      dbService.createConversation('clear-1', 'To Clear')
      dbService.saveMessage({
        id: 'clear-msg-1',
        conversationId: 'clear-1',
        role: 'user',
        content: 'Test',
        timestamp: Date.now()
      })
      
      dbService.clearAll()
      
      const conversations = dbService.getConversations()
      const stats = dbService.getStats()
      
      expect(conversations.length).toBe(0)
      expect(stats.totalMessages).toBe(0)
    })
  })
})

