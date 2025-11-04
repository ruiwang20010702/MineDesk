/**
 * 错误处理工具函数
 * 统一处理和格式化错误消息
 */

export interface AppError {
  code: string
  message: string
  details?: string
  timestamp: number
}

/**
 * 错误类型定义
 */
export enum ErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // 服务错误
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  SCREENPIPE_ERROR = 'SCREENPIPE_ERROR',
  MINECONTEXT_ERROR = 'MINECONTEXT_ERROR',
  
  // 数据库错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  SAVE_FAILED = 'SAVE_FAILED',
  LOAD_FAILED = 'LOAD_FAILED',
  
  // 应用错误
  INVALID_INPUT = 'INVALID_INPUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误消息映射
 */
const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: '网络连接失败',
  [ErrorCode.TIMEOUT]: '请求超时',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ErrorCode.SCREENPIPE_ERROR]: 'Screenpipe 服务错误',
  [ErrorCode.MINECONTEXT_ERROR]: 'MineContext 服务错误',
  [ErrorCode.DATABASE_ERROR]: '数据库错误',
  [ErrorCode.SAVE_FAILED]: '保存失败',
  [ErrorCode.LOAD_FAILED]: '加载失败',
  [ErrorCode.INVALID_INPUT]: '输入无效',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误'
}

/**
 * 创建应用错误
 */
export function createAppError(
  code: ErrorCode,
  details?: string
): AppError {
  return {
    code,
    message: errorMessages[code] || errorMessages[ErrorCode.UNKNOWN_ERROR],
    details,
    timestamp: Date.now()
  }
}

/**
 * 解析错误对象
 */
export function parseError(error: unknown): AppError {
  // 如果已经是 AppError
  if (isAppError(error)) {
    return error
  }

  // 如果是 Error 对象
  if (error instanceof Error) {
    // 检查网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createAppError(ErrorCode.NETWORK_ERROR, error.message)
    }
    
    // 检查超时错误
    if (error.message.includes('timeout')) {
      return createAppError(ErrorCode.TIMEOUT, error.message)
    }
    
    // 其他错误
    return createAppError(ErrorCode.UNKNOWN_ERROR, error.message)
  }

  // 如果是字符串
  if (typeof error === 'string') {
    return createAppError(ErrorCode.UNKNOWN_ERROR, error)
  }

  // 未知类型
  return createAppError(ErrorCode.UNKNOWN_ERROR, 'An unknown error occurred')
}

/**
 * 检查是否是 AppError
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  )
}

/**
 * 格式化错误消息（用于显示）
 */
export function formatErrorMessage(error: AppError): string {
  if (error.details) {
    return `${error.message}: ${error.details}`
  }
  return error.message
}

/**
 * 获取用户友好的错误提示
 */
export function getUserFriendlyMessage(error: AppError): {
  title: string
  message: string
  action?: string
} {
  switch (error.code) {
    case ErrorCode.NETWORK_ERROR:
      return {
        title: '网络连接失败',
        message: '请检查您的网络连接是否正常',
        action: '重试'
      }

    case ErrorCode.SERVICE_UNAVAILABLE:
      return {
        title: '服务暂时不可用',
        message: '请稍后再试或联系支持团队',
        action: '刷新'
      }

    case ErrorCode.SCREENPIPE_ERROR:
      return {
        title: 'Screenpipe 服务异常',
        message: '请确保 Screenpipe 正在运行（端口 3030）',
        action: '检查服务'
      }

    case ErrorCode.MINECONTEXT_ERROR:
      return {
        title: 'MineContext 服务异常',
        message: '请确保 MineContext 正在运行（端口 8000）',
        action: '检查服务'
      }

    case ErrorCode.DATABASE_ERROR:
      return {
        title: '数据库错误',
        message: '无法访问本地数据库，请重启应用',
        action: '重启'
      }

    case ErrorCode.SAVE_FAILED:
      return {
        title: '保存失败',
        message: '数据保存失败，请重试',
        action: '重试'
      }

    case ErrorCode.LOAD_FAILED:
      return {
        title: '加载失败',
        message: '数据加载失败，请刷新',
        action: '刷新'
      }

    case ErrorCode.PERMISSION_DENIED:
      return {
        title: '权限不足',
        message: '您没有执行此操作的权限',
        action: '取消'
      }

    default:
      return {
        title: '操作失败',
        message: error.details || '发生了一个意外错误',
        action: '关闭'
      }
  }
}

/**
 * 记录错误到控制台
 */
export function logError(error: AppError, context?: string): void {
  const prefix = context ? `[${context}]` : '[Error]'
  console.error(prefix, {
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: new Date(error.timestamp).toISOString()
  })
}

/**
 * 安全地执行异步操作
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): Promise<[T | null, AppError | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const appError = parseError(error)
    appError.code = errorCode
    logError(appError)
    return [null, appError]
  }
}

/**
 * 带重试的异步操作
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    errorCode?: ErrorCode
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, errorCode = ErrorCode.UNKNOWN_ERROR } = options
  
  let lastError: AppError | null = null
  
  for (let i = 0; i < retries; i++) {
    const [result, error] = await tryCatch(fn, errorCode)
    
    if (error === null && result !== null) {
      return result
    }
    
    lastError = error
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || createAppError(errorCode, 'All retries failed')
}

