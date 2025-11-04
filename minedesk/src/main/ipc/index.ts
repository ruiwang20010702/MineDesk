import { ipcMain, BrowserWindow } from 'electron'
import screenpipeService from '../services/ScreenpipeService'
import minecontextService from '../services/MineContextService'
import { databaseService } from '../services/DatabaseService'
import crewaiService from '../services/CrewAIService'

export function setupIpcHandlers() {
  // Screenpipe IPC handlers
  ipcMain.handle('screenpipe:search', async (_event, query: string, options?: any) => {
    try {
      return await screenpipeService.search(query, options)
    } catch (error: any) {
      console.error('IPC screenpipe:search error:', error)
      throw error
    }
  })

  ipcMain.handle('screenpipe:get-activities', async (_event, startTime?: number, endTime?: number) => {
    try {
      return await screenpipeService.getActivities(startTime, endTime)
    } catch (error: any) {
      console.error('IPC screenpipe:get-activities error:', error)
      throw error
    }
  })

  ipcMain.handle('screenpipe:get-status', async () => {
    try {
      return await screenpipeService.getStatus()
    } catch (error: any) {
      console.error('IPC screenpipe:get-status error:', error)
      throw error
    }
  })

  ipcMain.handle('screenpipe:get-current-context', async () => {
    try {
      return await screenpipeService.getCurrentContext()
    } catch (error: any) {
      console.error('IPC screenpipe:get-current-context error:', error)
      throw error
    }
  })

  ipcMain.handle('screenpipe:get-activity-summary', async (_event, startTime: number, endTime: number) => {
    try {
      return await screenpipeService.getActivitySummary(startTime, endTime)
    } catch (error: any) {
      console.error('IPC screenpipe:get-activity-summary error:', error)
      throw error
    }
  })

  // MineContext IPC handlers
  ipcMain.handle('minecontext:search', async (_event, query: string, options?: any) => {
    try {
      return await minecontextService.search(query, options)
    } catch (error: any) {
      console.error('IPC minecontext:search error:', error)
      throw error
    }
  })

  ipcMain.handle('minecontext:chat', async (_event, messages: any[], options?: any) => {
    try {
      return await minecontextService.chat(messages, options)
    } catch (error: any) {
      console.error('IPC minecontext:chat error:', error)
      throw error
    }
  })

  ipcMain.handle('minecontext:get-status', async () => {
    try {
      return await minecontextService.getStatus()
    } catch (error: any) {
      console.error('IPC minecontext:get-status error:', error)
      throw error
    }
  })

  ipcMain.handle('minecontext:get-context', async (_event, query: string, topK?: number) => {
    try {
      return await minecontextService.getContext(query, topK)
    } catch (error: any) {
      console.error('IPC minecontext:get-context error:', error)
      throw error
    }
  })

  ipcMain.handle('minecontext:get-stats', async () => {
    try {
      return await minecontextService.getStats()
    } catch (error: any) {
      console.error('IPC minecontext:get-stats error:', error)
      throw error
    }
  })

  // Database IPC handlers
  ipcMain.handle('database:create-conversation', async (_event, id: string, title?: string) => {
    try {
      return databaseService.createConversation(id, title)
    } catch (error: any) {
      console.error('IPC database:create-conversation error:', error)
      throw error
    }
  })

  ipcMain.handle('database:save-message', async (_event, message: any) => {
    try {
      databaseService.saveMessage(message)
      return { success: true }
    } catch (error: any) {
      console.error('IPC database:save-message error:', error)
      throw error
    }
  })

  ipcMain.handle('database:save-messages', async (_event, messages: any[]) => {
    try {
      databaseService.saveMessages(messages)
      return { success: true }
    } catch (error: any) {
      console.error('IPC database:save-messages error:', error)
      throw error
    }
  })

  ipcMain.handle('database:get-messages', async (_event, conversationId: string, limit?: number) => {
    try {
      return databaseService.getMessages(conversationId, limit)
    } catch (error: any) {
      console.error('IPC database:get-messages error:', error)
      throw error
    }
  })

  ipcMain.handle('database:get-conversations', async (_event, limit?: number) => {
    try {
      return databaseService.getConversations(limit)
    } catch (error: any) {
      console.error('IPC database:get-conversations error:', error)
      throw error
    }
  })

  ipcMain.handle('database:get-conversation', async (_event, id: string) => {
    try {
      return databaseService.getConversation(id)
    } catch (error: any) {
      console.error('IPC database:get-conversation error:', error)
      throw error
    }
  })

  ipcMain.handle('database:update-conversation-title', async (_event, id: string, title: string) => {
    try {
      databaseService.updateConversationTitle(id, title)
      return { success: true }
    } catch (error: any) {
      console.error('IPC database:update-conversation-title error:', error)
      throw error
    }
  })

  ipcMain.handle('database:delete-conversation', async (_event, id: string) => {
    try {
      databaseService.deleteConversation(id)
      return { success: true }
    } catch (error: any) {
      console.error('IPC database:delete-conversation error:', error)
      throw error
    }
  })

  ipcMain.handle('database:search-messages', async (_event, query: string, limit?: number) => {
    try {
      return databaseService.searchMessages(query, limit)
    } catch (error: any) {
      console.error('IPC database:search-messages error:', error)
      throw error
    }
  })

  ipcMain.handle('database:get-stats', async () => {
    try {
      return databaseService.getStats()
    } catch (error: any) {
      console.error('IPC database:get-stats error:', error)
      throw error
    }
  })

  // Window control handlers
  ipcMain.on('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.close()
  })

  ipcMain.on('window:hide', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.hide()
  })

  // CrewAI IPC handlers
  ipcMain.handle('crewai:get-status', async () => {
    try {
      return await crewaiService.getStatus()
    } catch (error: any) {
      console.error('IPC crewai:get-status error:', error)
      throw error
    }
  })

  ipcMain.handle('crewai:generate-report', async (_event, request) => {
    try {
      console.log('🚀 Generating weekly report...', request)
      return await crewaiService.generateReport(request)
    } catch (error: any) {
      console.error('IPC crewai:generate-report error:', error)
      throw error
    }
  })

  console.log('✅ IPC handlers registered')
}

