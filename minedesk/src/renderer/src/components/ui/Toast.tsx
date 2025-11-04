import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // 自动隐藏
    const duration = toast.duration || 5000
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, duration)
    }
  }, [hideToast])

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 7000 })
  }, [showToast])

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  }

  const iconStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right',
        styles[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">{toast.title}</h3>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// 辅助样式
const toastStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`

// 注入样式到 head
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = toastStyles
  document.head.appendChild(style)
}

