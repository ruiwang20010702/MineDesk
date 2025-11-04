import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary - React 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 更新 state
    this.setState({
      error,
      errorInfo
    })

    // 可以将错误发送到错误报告服务
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // TODO: 集成错误追踪服务（如 Sentry）
    console.log('Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 否则显示默认错误 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
            {/* 错误图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* 错误标题 */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              哎呀，出错了！
            </h1>

            {/* 错误描述 */}
            <p className="text-center text-gray-600 mb-8">
              应用遇到了一个意外错误。我们已经记录了这个问题，会尽快修复。
            </p>

            {/* 错误详情（开发模式） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  查看错误详情 (开发模式)
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">错误消息:</h3>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">堆栈跟踪:</h3>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto max-h-64 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-2">组件堆栈:</h3>
                      <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto max-h-64 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                尝试恢复
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                重新加载
              </button>
            </div>

            {/* 帮助信息 */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>如果问题持续存在，请尝试：</p>
              <ul className="mt-2 space-y-1">
                <li>• 重启 MineDesk 应用</li>
                <li>• 检查后端服务是否正常运行</li>
                <li>• 查看控制台日志获取更多信息</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 轻量级错误边界 - 用于局部组件
 */
export function SimpleErrorBoundary({ 
  children, 
  fallbackMessage = '加载失败' 
}: { 
  children: ReactNode
  fallbackMessage?: string
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{fallbackMessage}</span>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

