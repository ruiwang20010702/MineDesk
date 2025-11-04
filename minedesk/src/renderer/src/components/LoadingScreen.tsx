import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface ServiceStatus {
  available: boolean
  url: string
}

interface LoadingScreenProps {
  screenpipeStatus: ServiceStatus
  minecontextStatus: ServiceStatus
}

export function LoadingScreen({ screenpipeStatus, minecontextStatus }: LoadingScreenProps) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-bold">MineDesk</h1>
          <p className="text-sm text-muted-foreground">Initializing services...</p>
        </div>

        <div className="space-y-3">
          <ServiceStatusItem
            name="Screenpipe"
            description="Memory & Context Capture"
            status={screenpipeStatus}
          />
          <ServiceStatusItem
            name="MineContext"
            description="RAG & Knowledge Retrieval"
            status={minecontextStatus}
          />
        </div>

        {!screenpipeStatus.available && !minecontextStatus.available && (
          <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
              Services Not Running
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              MineDesk will start with limited functionality.
            </p>
            <p className="text-xs text-muted-foreground">
              You can start services later from Settings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceStatusItem({
  name,
  description,
  status
}: {
  name: string
  description: string
  status: ServiceStatus
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      {status.available ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
        {status.url && (
          <div className="text-xs text-muted-foreground mt-0.5">{status.url}</div>
        )}
      </div>
    </div>
  )
}

