import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Screenpipe API
  screenpipe: {
    search: (query: string, options?: any) => 
      ipcRenderer.invoke('screenpipe:search', query, options),
    getActivities: (startTime?: number, endTime?: number) =>
      ipcRenderer.invoke('screenpipe:get-activities', startTime, endTime),
    getStatus: () => ipcRenderer.invoke('screenpipe:get-status'),
    getCurrentContext: () => ipcRenderer.invoke('screenpipe:get-current-context'),
    getActivitySummary: (startTime: number, endTime: number) =>
      ipcRenderer.invoke('screenpipe:get-activity-summary', startTime, endTime)
  },

  // MineContext RAG API
  minecontext: {
    search: (query: string, options?: any) =>
      ipcRenderer.invoke('minecontext:search', query, options),
    chat: (messages: any[], options?: any) =>
      ipcRenderer.invoke('minecontext:chat', messages, options),
    getStatus: () => ipcRenderer.invoke('minecontext:get-status'),
    getContext: (query: string, topK?: number) =>
      ipcRenderer.invoke('minecontext:get-context', query, topK),
    getStats: () => ipcRenderer.invoke('minecontext:get-stats')
  },

  // Database API
  database: {
    createConversation: (id: string, title?: string) =>
      ipcRenderer.invoke('database:create-conversation', id, title),
    saveMessage: (message: any) =>
      ipcRenderer.invoke('database:save-message', message),
    saveMessages: (messages: any[]) =>
      ipcRenderer.invoke('database:save-messages', messages),
    getMessages: (conversationId: string, limit?: number) =>
      ipcRenderer.invoke('database:get-messages', conversationId, limit),
    getConversations: (limit?: number) =>
      ipcRenderer.invoke('database:get-conversations', limit),
    getConversation: (id: string) =>
      ipcRenderer.invoke('database:get-conversation', id),
    updateConversationTitle: (id: string, title: string) =>
      ipcRenderer.invoke('database:update-conversation-title', id, title),
    deleteConversation: (id: string) =>
      ipcRenderer.invoke('database:delete-conversation', id),
    searchMessages: (query: string, limit?: number) =>
      ipcRenderer.invoke('database:search-messages', query, limit),
    getStats: () =>
      ipcRenderer.invoke('database:get-stats')
  },

  // Window control
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    hide: () => ipcRenderer.send('window:hide')
  },

  // CrewAI API
  crewai: {
    getStatus: () => ipcRenderer.invoke('crewai:get-status'),
    generateReport: (request: any) =>
      ipcRenderer.invoke('crewai:generate-report', request)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

