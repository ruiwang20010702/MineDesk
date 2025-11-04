/**
 * Weekly Report Component
 * 
 * Allows users to generate automated weekly reports using CrewAI
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './style.css'

export function WeeklyReport() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [statistics, setStatistics] = useState<any>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setReport(null)
    setMetadata(null)
    setStatistics(null)
    
    try {
      // Calculate date range (last 7 days)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)
      
      console.log('🚀 Generating report...', {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })
      
      const response = await window.api.crewai.generateReport({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        options: {
          language: 'zh',
          include_activities: true,
          include_documents: true,
          include_conversations: true,
          template: 'default'
        }
      })
      
      console.log('✅ Report generated:', response)
      
      if (response.status === 'success' && response.data) {
        setReport(response.data.content)
        setMetadata(response.data.metadata)
        setStatistics(response.data.statistics)
      } else {
        setError(response.message || 'Failed to generate report')
        if (response.error) {
          console.error('Report generation error:', response.error)
        }
      }
    } catch (err: any) {
      console.error('Error generating report:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCurrentWeek = async () => {
    setLoading(true)
    setError(null)
    setReport(null)
    
    try {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      
      const monday = new Date(today)
      monday.setDate(today.getDate() + mondayOffset)
      
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      
      const response = await window.api.crewai.generateReport({
        start_date: monday.toISOString().split('T')[0],
        end_date: sunday.toISOString().split('T')[0],
        options: {
          language: 'zh',
          include_activities: true,
          include_documents: true,
          include_conversations: true
        }
      })
      
      if (response.status === 'success' && response.data) {
        setReport(response.data.content)
        setMetadata(response.data.metadata)
        setStatistics(response.data.statistics)
      } else {
        setError(response.message || 'Failed to generate report')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weekly_report_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="weekly-report-container">
      <div className="header">
        <h2>📊 Weekly Report</h2>
        <p className="subtitle">AI-powered weekly summary using CrewAI multi-agent workflow</p>
      </div>
      
      <div className="controls">
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="primary-button"
        >
          {loading ? '⏳ Generating...' : '📅 Generate Last 7 Days'}
        </button>
        
        <button 
          onClick={handleCurrentWeek}
          disabled={loading}
          className="secondary-button"
        >
          {loading ? '⏳ Generating...' : '📆 Generate Current Week'}
        </button>
      </div>
      
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <div className="loading-text">
            <p className="loading-title">🤖 CrewAI agents are working...</p>
            <p className="loading-subtitle">This may take up to 2 minutes</p>
            <ul className="loading-steps">
              <li>🔍 Collecting data from Screenpipe, MineContext, and Database</li>
              <li>📊 Analyzing productivity metrics and patterns</li>
              <li>✍️ Writing comprehensive report</li>
              <li>✅ Reviewing quality and accuracy</li>
              <li>💾 Exporting final report</li>
            </ul>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-state">
          <div className="error-icon">❌</div>
          <p className="error-title">Error generating report</p>
          <p className="error-message">{error}</p>
          <button onClick={() => setError(null)} className="dismiss-button">
            Dismiss
          </button>
        </div>
      )}
      
      {report && !loading && (
        <div className="report-container">
          {metadata && (
            <div className="report-metadata">
              <div className="metadata-item">
                <span className="label">📅 Generated:</span>
                <span className="value">
                  {new Date(metadata.generated_at).toLocaleString()}
                </span>
              </div>
              <div className="metadata-item">
                <span className="label">⏱️ Duration:</span>
                <span className="value">{metadata.duration_seconds?.toFixed(1)}s</span>
              </div>
              <div className="metadata-item">
                <span className="label">📝 Words:</span>
                <span className="value">{metadata.word_count}</span>
              </div>
              <button onClick={downloadReport} className="download-button">
                💾 Download Markdown
              </button>
            </div>
          )}
          
          {statistics && (
            <div className="report-statistics">
              <div className="stat-card">
                <div className="stat-value">{statistics.total_activities || 0}</div>
                <div className="stat-label">Activities</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{statistics.total_documents || 0}</div>
                <div className="stat-label">Documents</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {statistics.total_time_hours?.toFixed(1) || 0}h
                </div>
                <div className="stat-label">Time Tracked</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {(statistics.productivity_score * 100)?.toFixed(0) || 0}%
                </div>
                <div className="stat-label">Productivity</div>
              </div>
            </div>
          )}
          
          <div className="report-content markdown-body">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}
      
      {!loading && !error && !report && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-title">No report generated yet</p>
          <p className="empty-subtitle">
            Click "Generate Last 7 Days" to create your first automated weekly report
          </p>
        </div>
      )}
    </div>
  )
}

