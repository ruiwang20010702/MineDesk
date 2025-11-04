import { AIAssistant } from './components/AIAssistant'
import { ContextPanel } from './components/ContextPanel'
import { TitleBar } from './components/TitleBar'
import { useServicesStatus } from './hooks/useServicesStatus'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'

function App() {
  const { screenpipeStatus, minecontextStatus, loading } = useServicesStatus()

  // Show loading screen only while initial service check is in progress
  if (loading) {
    return (
      <LoadingScreen
        screenpipeStatus={screenpipeStatus}
        minecontextStatus={minecontextStatus}
      />
    )
  }

  // Allow app to run even if services are not available (degraded mode)
  // Services status will be shown in the UI and users can start them later

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="h-screen w-screen flex flex-col text-foreground">
          {/* macOS Window with Glass Effect */}
          <div className="h-full w-full flex flex-col macos-window m-3">
            <TitleBar />
            <div className="flex-1 flex overflow-hidden">
              {/* Main chat area */}
              <div className="flex-1 flex flex-col">
                <ErrorBoundary fallback={
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-600">AI 助手加载失败</p>
                  </div>
                }>
                  <AIAssistant />
                </ErrorBoundary>
              </div>

              {/* Context panel (right sidebar) */}
              <div className="w-80 border-l border-border/50">
                <ErrorBoundary fallback={
                  <div className="flex items-center justify-center h-full p-4">
                    <p className="text-red-600 text-sm">上下文面板加载失败</p>
                  </div>
                }>
                  <ContextPanel />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App

