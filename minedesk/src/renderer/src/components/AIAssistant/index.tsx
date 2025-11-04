import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { MessageList } from './MessageList'
import { useChat } from '../../hooks/useChat'

export function AIAssistant() {
  const [input, setInput] = useState('')
  const { messages, isLoading, sendMessage } = useChat()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    await sendMessage(userMessage)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border/50">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me anything about your work context
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Enter to send, Shift+Enter for new line)"
            className="flex-1 macos-input resize-none text-sm"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="macos-button-primary px-6 py-3 self-end disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function EmptyState() {
  const suggestions = [
    'What have I been working on today?',
    'Summarize my recent activities',
    'Find information about the project I was working on',
    'What apps did I use most this week?'
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
        <span className="text-4xl">🧠</span>
      </div>
      <h3 className="text-2xl font-semibold mb-3">Welcome to MineDesk</h3>
      <p className="text-sm text-muted-foreground mb-10 max-w-md leading-relaxed">
        I can help you search your work context, retrieve documents, and answer questions
        based on your screen activities and knowledge base.
      </p>

      <div className="space-y-3 w-full max-w-md">
        <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Try asking:</p>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="w-full px-5 py-4 text-left text-sm rounded-xl context-card"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

