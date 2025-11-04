import { Minus, X } from 'lucide-react'

export function TitleBar() {
  const handleMinimize = () => {
    window.api.window.minimize()
  }

  const handleClose = () => {
    window.api.window.hide()
  }

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 app-drag">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
        <span className="text-sm font-semibold">MineDesk</span>
      </div>

      <div className="flex items-center gap-2 app-no-drag">
        <button
          onClick={handleMinimize}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="Close (Hide)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

