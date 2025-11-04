import { useState } from 'react'
import { Clock, Monitor, Activity, FileText } from 'lucide-react'
import { useCurrentContext } from '../../hooks/useCurrentContext'
import { useActivitySummary } from '../../hooks/useActivitySummary'
import { WeeklyReport } from '../WeeklyReport'

export function ContextPanel() {
  const [selectedTab, setSelectedTab] = useState<'current' | 'timeline' | 'summary' | 'weekly'>('current')

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-5 border-b border-border/50">
        <h3 className="font-semibold text-lg">Context</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 px-2 pt-2">
        <TabButton
          active={selectedTab === 'current'}
          onClick={() => setSelectedTab('current')}
          icon={<Monitor className="w-4 h-4" />}
        >
          Current
        </TabButton>
        <TabButton
          active={selectedTab === 'timeline'}
          onClick={() => setSelectedTab('timeline')}
          icon={<Clock className="w-4 h-4" />}
        >
          Timeline
        </TabButton>
        <TabButton
          active={selectedTab === 'summary'}
          onClick={() => setSelectedTab('summary')}
          icon={<Activity className="w-4 h-4" />}
        >
          Summary
        </TabButton>
        <TabButton
          active={selectedTab === 'weekly'}
          onClick={() => setSelectedTab('weekly')}
          icon={<FileText className="w-4 h-4" />}
        >
          Weekly
        </TabButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTab === 'current' && <CurrentContextView />}
        {selectedTab === 'timeline' && <TimelineView />}
        {selectedTab === 'summary' && <SummaryView />}
        {selectedTab === 'weekly' && <WeeklyReport />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-2 tab-button ${
        active ? 'tab-button-active' : ''
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function CurrentContextView() {
  const { context, loading, error } = useCurrentContext()

  if (loading) {
    return (
      <div className="p-5 text-center text-sm text-muted-foreground">Loading context...</div>
    )
  }

  if (error || !context) {
    return (
      <div className="p-5 space-y-3">
        <div className="context-card text-center">
          <p className="text-sm text-muted-foreground">
            Screenpipe service is not available
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Start Screenpipe to see your current context
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-3">
      <InfoCard title="Current Application" value={context.app} icon="💻" />
      <InfoCard title="Window" value={context.window} icon="📄" />
      <InfoCard
        title="Last Updated"
        value={new Date(context.timestamp).toLocaleTimeString()}
        icon="⏰"
      />
      {context.recentText && (
        <div className="context-card text-xs">
          <div className="font-semibold mb-2 text-sm">Recent Content</div>
          <div className="text-muted-foreground line-clamp-3 leading-relaxed">{context.recentText}</div>
        </div>
      )}
    </div>
  )
}

function TimelineView() {
  return (
    <div className="p-4 text-center text-sm text-muted-foreground">
      Timeline view coming soon...
    </div>
  )
}

function SummaryView() {
  const { summary, loading } = useActivitySummary()

  if (loading) {
    return (
      <div className="p-5 text-center text-sm text-muted-foreground">Loading summary...</div>
    )
  }

  if (!summary) {
    return (
      <div className="p-5 text-center text-sm text-muted-foreground">
        No activity data available
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      <div className="context-card">
        <h4 className="text-xs font-semibold mb-3 uppercase tracking-wide">Top Applications</h4>
        <div className="space-y-2.5">
          {summary.apps.slice(0, 5).map((app, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="truncate font-medium">{app.name}</span>
              <span className="text-muted-foreground ml-2">{app.duration}m</span>
            </div>
          ))}
        </div>
      </div>

      <div className="context-card">
        <h4 className="text-xs font-semibold mb-3 uppercase tracking-wide">Top Windows</h4>
        <div className="space-y-2.5">
          {summary.topWindows.slice(0, 5).map((window, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="truncate font-medium">{window.title}</span>
              <span className="text-muted-foreground ml-2">{window.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  title,
  value,
  icon
}: {
  title: string
  value: string
  icon: string
}) {
  return (
    <div className="context-card">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  )
}

