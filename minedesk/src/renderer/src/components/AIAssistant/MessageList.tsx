import { useEffect, useRef } from 'react'
import { User, Bot, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="p-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`message-bubble ${
          isUser ? 'message-bubble-user' : 'message-bubble-assistant'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="markdown-body prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        <p className="text-[11px] mt-2 opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="message-bubble message-bubble-assistant">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-muted-foreground">正在思考...</span>
        </div>
      </div>
    </div>
  )
}

