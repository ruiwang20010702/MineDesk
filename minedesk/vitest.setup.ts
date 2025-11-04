import { beforeEach, vi } from 'vitest'

// Mock Electron APIs
beforeEach(() => {
  // Mock window.api
  global.window = {
    ...global.window,
    api: {
      screenpipe: {
        search: vi.fn(),
        getActivities: vi.fn(),
        getStatus: vi.fn(),
        getCurrentContext: vi.fn(),
        getActivitySummary: vi.fn()
      },
      minecontext: {
        search: vi.fn(),
        chat: vi.fn(),
        getStatus: vi.fn(),
        getContext: vi.fn(),
        getStats: vi.fn()
      },
      database: {
        createConversation: vi.fn(),
        saveMessage: vi.fn(),
        saveMessages: vi.fn(),
        getMessages: vi.fn(),
        getConversations: vi.fn(),
        getConversation: vi.fn(),
        updateConversationTitle: vi.fn(),
        deleteConversation: vi.fn(),
        searchMessages: vi.fn(),
        getStats: vi.fn()
      },
      window: {
        minimize: vi.fn(),
        maximize: vi.fn(),
        close: vi.fn(),
        hide: vi.fn()
      }
    }
  } as any
})

