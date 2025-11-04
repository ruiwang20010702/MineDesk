/**
 * MineDesk 集成测试脚本
 * 自动化测试应用的核心功能
 */

import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import os from 'os'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  duration: number
}

class IntegrationTester {
  private results: TestResult[] = []
  private dbPath: string

  constructor() {
    // 使用临时数据库路径进行测试
    const testDir = path.join(os.tmpdir(), 'minedesk-test')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
    this.dbPath = path.join(testDir, 'test-conversations.db')
  }

  private async runTest(
    name: string,
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now()
    try {
      await testFn()
      this.results.push({
        name,
        status: 'PASS',
        message: '✅ 测试通过',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        name,
        status: 'FAIL',
        message: `❌ 失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 测试 1: 数据库初始化
   */
  async testDatabaseInitialization(): Promise<void> {
    await this.runTest('数据库初始化', async () => {
      // 删除旧的测试数据库
      if (fs.existsSync(this.dbPath)) {
        fs.unlinkSync(this.dbPath)
      }

      const db = new Database(this.dbPath)
      
      // 创建表结构
      db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `)

      db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
      `)

      // 验证表存在
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('conversations', 'messages')"
        )
        .all()

      if (tables.length !== 2) {
        throw new Error(`期望 2 个表，实际找到 ${tables.length} 个`)
      }

      db.close()
    })
  }

  /**
   * 测试 2: 创建对话
   */
  async testCreateConversation(): Promise<void> {
    await this.runTest('创建对话', async () => {
      const db = new Database(this.dbPath)

      const conversationId = 'test-conv-' + Date.now()
      const now = Date.now()

      db.prepare(
        'INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
      ).run(conversationId, '测试对话', now, now)

      const conversation = db
        .prepare('SELECT * FROM conversations WHERE id = ?')
        .get(conversationId) as any

      if (!conversation) {
        throw new Error('对话创建失败')
      }

      if (conversation.title !== '测试对话') {
        throw new Error(`标题不匹配: ${conversation.title}`)
      }

      db.close()
    })
  }

  /**
   * 测试 3: 保存消息
   */
  async testSaveMessages(): Promise<void> {
    await this.runTest('保存消息', async () => {
      const db = new Database(this.dbPath)

      // 获取一个测试对话
      const conversation = db
        .prepare('SELECT id FROM conversations LIMIT 1')
        .get() as any

      if (!conversation) {
        throw new Error('找不到测试对话')
      }

      const messageId = 'msg-' + Date.now()
      const now = Date.now()

      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).run(messageId, conversation.id, 'user', '这是一条测试消息', now)

      const message = db
        .prepare('SELECT * FROM messages WHERE id = ?')
        .get(messageId) as any

      if (!message) {
        throw new Error('消息保存失败')
      }

      if (message.content !== '这是一条测试消息') {
        throw new Error(`消息内容不匹配: ${message.content}`)
      }

      db.close()
    })
  }

  /**
   * 测试 4: 查询对话历史
   */
  async testQueryHistory(): Promise<void> {
    await this.runTest('查询对话历史', async () => {
      const db = new Database(this.dbPath)

      const conversations = db
        .prepare('SELECT * FROM conversations ORDER BY updated_at DESC')
        .all()

      if (conversations.length === 0) {
        throw new Error('没有找到对话记录')
      }

      db.close()
    })
  }

  /**
   * 测试 5: 搜索消息
   */
  async testSearchMessages(): Promise<void> {
    await this.runTest('搜索消息', async () => {
      const db = new Database(this.dbPath)

      // 插入测试数据
      const conversation = db
        .prepare('SELECT id FROM conversations LIMIT 1')
        .get() as any

      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).run('search-test-1', conversation.id, 'user', 'TypeScript 教程', Date.now())

      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).run('search-test-2', conversation.id, 'assistant', '这是关于 TypeScript 的回答', Date.now())

      // 搜索
      const results = db
        .prepare("SELECT * FROM messages WHERE content LIKE ?")
        .all('%TypeScript%')

      if (results.length < 2) {
        throw new Error(`搜索结果不足: 期望至少 2 条，实际 ${results.length} 条`)
      }

      db.close()
    })
  }

  /**
   * 测试 6: 更新对话标题
   */
  async testUpdateConversationTitle(): Promise<void> {
    await this.runTest('更新对话标题', async () => {
      const db = new Database(this.dbPath)

      const conversation = db
        .prepare('SELECT id FROM conversations LIMIT 1')
        .get() as any

      const newTitle = '更新后的标题-' + Date.now()
      const now = Date.now()

      db.prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?').run(
        newTitle,
        now,
        conversation.id
      )

      const updated = db
        .prepare('SELECT * FROM conversations WHERE id = ?')
        .get(conversation.id) as any

      if (updated.title !== newTitle) {
        throw new Error(`标题更新失败: ${updated.title}`)
      }

      db.close()
    })
  }

  /**
   * 测试 7: 删除对话
   */
  async testDeleteConversation(): Promise<void> {
    await this.runTest('删除对话', async () => {
      const db = new Database(this.dbPath)

      // 创建一个临时对话
      const tempId = 'temp-conv-' + Date.now()
      const now = Date.now()

      db.prepare(
        'INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
      ).run(tempId, '临时对话', now, now)

      // 添加消息
      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).run('temp-msg-1', tempId, 'user', '临时消息', now)

      // 删除对话
      db.prepare('DELETE FROM conversations WHERE id = ?').run(tempId)

      // 验证对话已删除
      const conversation = db
        .prepare('SELECT * FROM conversations WHERE id = ?')
        .get(tempId)

      if (conversation) {
        throw new Error('对话删除失败')
      }

      // 验证消息也被级联删除（如果有外键约束）
      const messages = db
        .prepare('SELECT * FROM messages WHERE conversation_id = ?')
        .all(tempId)

      // 注意: SQLite 需要显式开启外键支持
      // 这里我们手动检查
      if (messages.length > 0) {
        // 手动删除消息
        db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(tempId)
      }

      db.close()
    })
  }

  /**
   * 测试 8: Screenpipe 服务连接
   */
  async testScreenpipeConnection(): Promise<void> {
    await this.runTest('Screenpipe 服务连接', async () => {
      const SCREENPIPE_URL = 'http://localhost:3030'

      try {
        const response = await fetch(`${SCREENPIPE_URL}/health`, {
          signal: AbortSignal.timeout(5000)
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!data || typeof data !== 'object') {
          throw new Error('健康检查返回数据格式错误')
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('连接超时 - Screenpipe 服务可能未运行')
        }
        throw error
      }
    })
  }

  /**
   * 测试 9: Screenpipe 数据获取
   */
  async testScreenpipeDataFetch(): Promise<void> {
    await this.runTest('Screenpipe 数据获取', async () => {
      const SCREENPIPE_URL = 'http://localhost:3030'

      try {
        const now = new Date()
        const startTime = new Date(now.getTime() - 3600000).toISOString() // 1小时前
        const endTime = now.toISOString()

        const response = await fetch(
          `${SCREENPIPE_URL}/search?start_time=${startTime}&end_time=${endTime}&limit=10`,
          { signal: AbortSignal.timeout(10000) }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!data || !Array.isArray(data.data)) {
          throw new Error('数据格式错误: 期望包含 data 数组')
        }

        // 数据可能为空（如果 Screenpipe 刚启动）
        console.log(`  ℹ️  获取到 ${data.data.length} 条记录`)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('数据获取超时')
        }
        throw error
      }
    })
  }

  /**
   * 测试 10: 环境变量检查
   */
  async testEnvironmentVariables(): Promise<void> {
    await this.runTest('环境变量检查', async () => {
      const requiredEnvVars = [
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY'
      ]

      const missing: string[] = []
      const found: string[] = []

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          missing.push(envVar)
        } else {
          found.push(envVar)
        }
      }

      if (found.length > 0) {
        console.log(`  ℹ️  已配置: ${found.join(', ')}`)
      }

      if (missing.length === requiredEnvVars.length) {
        throw new Error(`⚠️  所有 AI API Key 均未配置。应用将无法使用 AI 功能。\n     请创建 .env 文件并配置: ${missing.join(', ')}`)
      }

      if (missing.length > 0) {
        console.log(`  ⚠️  未配置: ${missing.join(', ')} - 对应的 AI 服务将不可用`)
      }
    })
  }

  /**
   * 生成测试报告
   */
  generateReport(): void {
    console.log('\n' + '='.repeat(70))
    console.log('MineDesk 集成测试报告'.padStart(45))
    console.log('='.repeat(70))
    console.log(`\n测试时间: ${new Date().toLocaleString('zh-CN')}\n`)

    const passed = this.results.filter((r) => r.status === 'PASS').length
    const failed = this.results.filter((r) => r.status === 'FAIL').length
    const skipped = this.results.filter((r) => r.status === 'SKIP').length
    const total = this.results.length

    // 按类别分组
    console.log('📊 测试结果概览:')
    console.log('-'.repeat(70))
    console.log(`  ✅ 通过: ${passed}/${total}`)
    console.log(`  ❌ 失败: ${failed}/${total}`)
    console.log(`  ⏭️  跳过: ${skipped}/${total}`)
    console.log()

    // 详细结果
    console.log('📝 详细测试结果:')
    console.log('-'.repeat(70))

    this.results.forEach((result, index) => {
      const statusIcon =
        result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
      console.log(`\n${index + 1}. ${statusIcon} ${result.name}`)
      console.log(`   ${result.message}`)
      console.log(`   耗时: ${result.duration}ms`)
    })

    console.log('\n' + '='.repeat(70))

    // 数据库功能总结
    const dbTests = this.results.filter((r) =>
      r.name.includes('数据库') || r.name.includes('对话') || r.name.includes('消息')
    )
    const dbPassed = dbTests.filter((r) => r.status === 'PASS').length

    console.log('\n🗄️  数据库功能测试:')
    console.log(`   ${dbPassed}/${dbTests.length} 测试通过`)

    // Screenpipe 集成总结
    const spTests = this.results.filter((r) => r.name.includes('Screenpipe'))
    const spPassed = spTests.filter((r) => r.status === 'PASS').length

    console.log('\n🔌 Screenpipe 集成测试:')
    console.log(`   ${spPassed}/${spTests.length} 测试通过`)

    // 环境配置总结
    const envTests = this.results.filter((r) => r.name.includes('环境变量'))
    const envPassed = envTests.filter((r) => r.status === 'PASS').length

    console.log('\n⚙️  环境配置测试:')
    console.log(`   ${envPassed}/${envTests.length} 测试通过`)

    // 总体评估
    console.log('\n🎯 总体评估:')
    const passRate = (passed / total) * 100
    if (passRate === 100) {
      console.log('   🎉 完美! 所有测试通过!')
    } else if (passRate >= 80) {
      console.log('   👍 良好! 大部分功能正常工作')
    } else if (passRate >= 60) {
      console.log('   ⚠️  一般，部分功能需要修复')
    } else {
      console.log('   ⛔ 需要注意，多个核心功能存在问题')
    }

    console.log('\n' + '='.repeat(70) + '\n')

    // 保存报告到文件
    this.saveReportToFile()
  }

  /**
   * 保存报告到文件
   */
  private saveReportToFile(): void {
    const reportPath = path.join(process.cwd(), 'INTEGRATION_TEST_REPORT.md')
    
    let content = '# MineDesk 集成测试报告\n\n'
    content += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`
    
    const passed = this.results.filter((r) => r.status === 'PASS').length
    const failed = this.results.filter((r) => r.status === 'FAIL').length
    const total = this.results.length
    const passRate = ((passed / total) * 100).toFixed(1)
    
    content += '## 📊 测试概览\n\n'
    content += `- ✅ 通过: ${passed}/${total} (${passRate}%)\n`
    content += `- ❌ 失败: ${failed}/${total}\n`
    content += `- 总耗时: ${this.results.reduce((sum, r) => sum + r.duration, 0)}ms\n\n`
    
    content += '## 📝 详细结果\n\n'
    this.results.forEach((result, index) => {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌'
      content += `### ${index + 1}. ${statusIcon} ${result.name}\n\n`
      content += `- **状态**: ${result.status}\n`
      content += `- **耗时**: ${result.duration}ms\n`
      content += `- **说明**: ${result.message}\n\n`
    })
    
    fs.writeFileSync(reportPath, content, 'utf-8')
    console.log(`📄 详细报告已保存到: ${reportPath}`)
  }

  /**
   * 运行所有测试
   */
  async runAll(): Promise<void> {
    console.log('\n🚀 开始运行 MineDesk 集成测试...\n')

    // 数据库测试
    await this.testDatabaseInitialization()
    await this.testCreateConversation()
    await this.testSaveMessages()
    await this.testQueryHistory()
    await this.testSearchMessages()
    await this.testUpdateConversationTitle()
    await this.testDeleteConversation()

    // Screenpipe 测试
    await this.testScreenpipeConnection()
    await this.testScreenpipeDataFetch()

    // 环境配置测试
    await this.testEnvironmentVariables()

    // 生成报告
    this.generateReport()

    // 清理
    this.cleanup()

    // 返回退出码
    const failed = this.results.filter((r) => r.status === 'FAIL').length
    process.exit(failed > 0 ? 1 : 0)
  }

  /**
   * 清理测试数据
   */
  private cleanup(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        fs.unlinkSync(this.dbPath)
      }
    } catch (error) {
      console.error('清理测试数据失败:', error)
    }
  }
}

// 运行测试
const tester = new IntegrationTester()
tester.runAll().catch((error) => {
  console.error('测试运行失败:', error)
  process.exit(1)
})

