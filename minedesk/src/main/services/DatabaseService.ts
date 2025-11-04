import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import log from 'electron-log'

// 数据类型定义
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  conversationId: string
  sources?: string[] // RAG 引用来源
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

/**
 * DatabaseService - 对话历史持久化服务
 * 使用 SQLite 存储对话记录和消息
 */
export class DatabaseService {
  private db: Database.Database | null = null
  private dbPath: string

  constructor(dbPath?: string) {
    if (dbPath) {
      // 用于测试：使用提供的路径（如 ':memory:'）
      this.dbPath = dbPath
      log.info(`Database path (test): ${this.dbPath}`)
    } else {
      // 生产环境：使用 userData 路径
      const userDataPath = app.getPath('userData')
      const dbDir = path.join(userDataPath, 'data')
      
      // 确保目录存在
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
      
      this.dbPath = path.join(dbDir, 'conversations.db')
      log.info(`Database path: ${this.dbPath}`)
    }
  }

  /**
   * 初始化数据库连接和表结构
   */
  initialize(): void {
    try {
      this.db = new Database(this.dbPath)
      this.db.pragma('journal_mode = WAL') // 性能优化
      
      this.createTables()
      log.info('Database initialized successfully')
    } catch (error) {
      log.error('Failed to initialize database:', error)
      throw error
    }
  }

  /**
   * 创建数据库表
   */
  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized')

    // 对话表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        message_count INTEGER DEFAULT 0
      )
    `)

    // 消息表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        sources TEXT, -- JSON array of source URLs
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `)

    // 创建索引优化查询
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversation_id, timestamp DESC)
    `)

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conversations_updated 
      ON conversations(updated_at DESC)
    `)
  }

  /**
   * 创建新对话
   */
  createConversation(id: string, title: string = '新对话'): Conversation {
    if (!this.db) throw new Error('Database not initialized')

    const now = Date.now()
    const conversation: Conversation = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      messageCount: 0
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO conversations (id, title, created_at, updated_at, message_count)
        VALUES (?, ?, ?, ?, ?)
      `)
      
      stmt.run(id, title, now, now, 0)
      log.info(`Created conversation: ${id}`)
      
      return conversation
    } catch (error) {
      log.error('Failed to create conversation:', error)
      throw error
    }
  }

  /**
   * 保存消息
   */
  saveMessage(message: Message): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, timestamp, sources)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      
      stmt.run(
        message.id,
        message.conversationId,
        message.role,
        message.content,
        message.timestamp,
        message.sources ? JSON.stringify(message.sources) : null
      )

      // 更新对话的消息计数和更新时间
      this.updateConversationStats(message.conversationId)
      
      log.info(`Saved message: ${message.id}`)
    } catch (error) {
      log.error('Failed to save message:', error)
      throw error
    }
  }

  /**
   * 批量保存消息（事务）
   */
  saveMessages(messages: Message[]): void {
    if (!this.db) throw new Error('Database not initialized')
    if (messages.length === 0) return

    const saveMessage = this.db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, timestamp, sources)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const transaction = this.db.transaction((msgs: Message[]) => {
      for (const message of msgs) {
        saveMessage.run(
          message.id,
          message.conversationId,
          message.role,
          message.content,
          message.timestamp,
          message.sources ? JSON.stringify(message.sources) : null
        )
      }
      
      // 更新对话统计（假设都是同一个对话）
      if (msgs.length > 0) {
        this.updateConversationStats(msgs[0].conversationId)
      }
    })

    try {
      transaction(messages)
      log.info(`Saved ${messages.length} messages in transaction`)
    } catch (error) {
      log.error('Failed to save messages:', error)
      throw error
    }
  }

  /**
   * 更新对话统计信息
   */
  private updateConversationStats(conversationId: string): void {
    if (!this.db) return

    const stmt = this.db.prepare(`
      UPDATE conversations 
      SET updated_at = ?,
          message_count = (SELECT COUNT(*) FROM messages WHERE conversation_id = ?)
      WHERE id = ?
    `)
    
    stmt.run(Date.now(), conversationId, conversationId)
  }

  /**
   * 获取对话的所有消息
   */
  getMessages(conversationId: string, limit: number = 100): Message[] {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare(`
        SELECT id, conversation_id, role, content, timestamp, sources
        FROM messages
        WHERE conversation_id = ?
        ORDER BY timestamp ASC
        LIMIT ?
      `)
      
      const rows = stmt.all(conversationId, limit) as any[]
      
      return rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        timestamp: row.timestamp,
        sources: row.sources ? JSON.parse(row.sources) : undefined
      }))
    } catch (error) {
      log.error('Failed to get messages:', error)
      throw error
    }
  }

  /**
   * 获取所有对话列表
   */
  getConversations(limit: number = 50): Conversation[] {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare(`
        SELECT id, title, created_at, updated_at, message_count
        FROM conversations
        ORDER BY updated_at DESC
        LIMIT ?
      `)
      
      const rows = stmt.all(limit) as any[]
      
      return rows.map(row => ({
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        messageCount: row.message_count
      }))
    } catch (error) {
      log.error('Failed to get conversations:', error)
      throw error
    }
  }

  /**
   * 获取单个对话
   */
  getConversation(id: string): Conversation | null {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare(`
        SELECT id, title, created_at, updated_at, message_count
        FROM conversations
        WHERE id = ?
      `)
      
      const row = stmt.get(id) as any
      
      if (!row) return null
      
      return {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        messageCount: row.message_count
      }
    } catch (error) {
      log.error('Failed to get conversation:', error)
      throw error
    }
  }

  /**
   * 更新对话标题
   */
  updateConversationTitle(id: string, title: string): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare(`
        UPDATE conversations
        SET title = ?, updated_at = ?
        WHERE id = ?
      `)
      
      stmt.run(title, Date.now(), id)
      log.info(`Updated conversation title: ${id}`)
    } catch (error) {
      log.error('Failed to update conversation title:', error)
      throw error
    }
  }

  /**
   * 删除对话（级联删除消息）
   */
  deleteConversation(id: string): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare('DELETE FROM conversations WHERE id = ?')
      stmt.run(id)
      log.info(`Deleted conversation: ${id}`)
    } catch (error) {
      log.error('Failed to delete conversation:', error)
      throw error
    }
  }

  /**
   * 搜索消息内容
   */
  searchMessages(query: string, limit: number = 50): Message[] {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const stmt = this.db.prepare(`
        SELECT id, conversation_id, role, content, timestamp, sources
        FROM messages
        WHERE content LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
      `)
      
      const rows = stmt.all(`%${query}%`, limit) as any[]
      
      return rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        timestamp: row.timestamp,
        sources: row.sources ? JSON.parse(row.sources) : undefined
      }))
    } catch (error) {
      log.error('Failed to search messages:', error)
      throw error
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): ConversationStats {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const statsRow = this.db.prepare(`
        SELECT 
          COUNT(*) as total_conversations,
          (SELECT COUNT(*) FROM messages) as total_messages,
          MAX(updated_at) as last_conversation_date
        FROM conversations
      `).get() as any

      const avgRow = this.db.prepare(`
        SELECT AVG(message_count) as avg_messages
        FROM conversations
      `).get() as any

      return {
        totalConversations: statsRow.total_conversations || 0,
        totalMessages: statsRow.total_messages || 0,
        avgMessagesPerConversation: avgRow.avg_messages || 0,
        lastConversationDate: statsRow.last_conversation_date || null
      }
    } catch (error) {
      log.error('Failed to get stats:', error)
      throw error
    }
  }

  /**
   * 清空所有数据
   */
  clearAll(): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      this.db.exec('DELETE FROM messages')
      this.db.exec('DELETE FROM conversations')
      log.warn('Cleared all conversations and messages')
    } catch (error) {
      log.error('Failed to clear database:', error)
      throw error
    }
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      log.info('Database connection closed')
    }
  }

  /**
   * 备份数据库
   */
  backup(backupPath: string): void {
    if (!this.db) throw new Error('Database not initialized')

    try {
      // 使用 better-sqlite3 的 backup API
      const backup = this.db.backup(backupPath) as any
      // 等待备份完成
      Promise.resolve(backup).then(() => {
        log.info(`Database backed up to: ${backupPath}`)
      }).catch((error) => {
        log.error('Failed to backup database:', error)
      })
    } catch (error) {
      log.error('Failed to backup database:', error)
      throw error
    }
  }
}

// 导出单例
export const databaseService = new DatabaseService()

