import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

function useApi(url, interval = 30000) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!url) return
    const load = () => fetch(url).then(r => r.json()).then(setData).catch(() => {})
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [url, interval])
  return data
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function StatusDot({ ok }) {
  return <span style={{
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
    background: ok === true ? '#10b981' : ok === false ? '#ef4444' : ok === 'warn' ? '#f59e0b' : '#333',
    marginRight: 6, flexShrink: 0
  }}></span>
}

export default function AgentPage() {
  const router = useRouter()
  const { name } = router.query

  const agents = useApi('/api/agents' + (name ? `?agent=${name}` : ''))
  const fleet = useApi('/api/fleet-health')
  const sessions = useApi('/api/sessions')
  const gov = useApi('/api/governance')

  const report = agents?.reports?.[name]
  const fullReport = report?.fullReport
  const agentHealth = fleet?.agents?.find(a => a.name === name)
  const agentSessions = sessions?.byAgent?.[name]
  const heartbeatStatus = sessions?.heartbeats?.[name]
  const govAgent = gov?.agents?.find(a => a.name === name)

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{name || 'Agent'} — Command Centre</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 16px; max-width: 900px; margin: 0 auto; }
          a { color: #3b82f6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .back { font-size: 12px; margin-bottom: 16px; display: inline-block; }
          .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 22px; color: #fff; }
          .tag { font-size: 9px; padding: 3px 8px; border-radius: 5px; font-weight: 600; }
          .tag.ok { background: #0a2a1a; color: #10b981; border: 1px solid #10b981; }
          .tag.fail { background: #3b1010; color: #ef4444; border: 1px solid #ef4444; }
          .tag.warn { background: #2a2000; color: #f59e0b; border: 1px solid #f59e0b; }
          .tag.off { background: #1a1a1a; color: #555; border: 1px solid #333; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
          @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
          .card { background: #111; border: 1px solid #222; border-radius: 10px; padding: 14px; }
          .card-title { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
          .stat { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
          .stat-label { font-size: 10px; color: #555; }
          .row { font-size: 11px; color: #aaa; padding: 4px 0; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #1a1a1a; }
          .row:last-child { border-bottom: none; }
          .full-report { background: #111; border: 1px solid #222; border-radius: 10px; padding: 16px; margin-top: 12px; }
          .full-report pre { font-size: 11px; color: #aaa; white-space: pre-wrap; word-break: break-word; line-height: 1.6; }
          .section { margin-top: 16px; }
          .section-title { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; border-bottom: 1px solid #1a1a1a; padding-bottom: 4px; }
          .ctx-bar { height: 6px; background: #1a1a1a; border-radius: 3px; margin-top: 6px; overflow: hidden; }
          .ctx-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
          .session-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 8px; padding: 10px; margin-top: 6px; }
          .session-meta { font-size: 9px; color: #444; }
        `}</style>
      </Head>

      <div>
        <a href="/" className="back">← Back to Dashboard</a>
        <div className="header">
          <StatusDot ok={agentHealth?.healthy} />
          <h1>{name || '...'}</h1>
          {agentHealth && (
            <span className={`tag ${agentHealth.healthy ? 'ok' : 'fail'}`}>
              {agentHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}
            </span>
          )}
          {heartbeatStatus && (
            <span className={`tag ${heartbeatStatus === 'disabled' ? 'off' : heartbeatStatus === 'ok' ? 'ok' : 'warn'}`}>
              HB: {heartbeatStatus}
            </span>
          )}
        </div>

        <div className="grid">
          {/* Context Usage */}
          <div className="card">
            <div className="card-title">Context Usage</div>
            <div className="stat" style={{ color: (agentSessions?.avgContextPct || 0) > 80 ? '#ef4444' : (agentSessions?.avgContextPct || 0) > 50 ? '#f59e0b' : '#10b981' }}>
              {agentSessions?.avgContextPct != null ? `${agentSessions.avgContextPct}%` : '—'}
            </div>
            <div className="stat-label">avg across {agentSessions?.sessions?.length || 0} session(s)</div>
            <div className="ctx-bar">
              <div className="ctx-fill" style={{
                width: `${agentSessions?.avgContextPct || 0}%`,
                background: (agentSessions?.avgContextPct || 0) > 80 ? '#ef4444' : (agentSessions?.avgContextPct || 0) > 50 ? '#f59e0b' : '#10b981'
              }}></div>
            </div>
          </div>

          {/* Governance */}
          <div className="card">
            <div className="card-title">Governance</div>
            <div className="row">
              <StatusDot ok={govAgent?.status === 'ok'} />
              {govAgent?.detail || 'No governance data'}
            </div>
          </div>

          {/* Latest Report */}
          <div className="card">
            <div className="card-title">Latest Report</div>
            {report ? (
              <>
                <div className="row"><StatusDot ok={report.fail === 0} />{report.title}</div>
                <div className="row" style={{ color: '#555' }}>Updated: {timeAgo(report.lastUpdated)}</div>
                <div className="row">✅ {report.pass} pass · ❌ {report.fail} fail · ⚠️ {report.warn} warn</div>
              </>
            ) : (
              <div className="row" style={{ color: '#555' }}>No report available</div>
            )}
          </div>

          {/* Model & Heartbeat */}
          <div className="card">
            <div className="card-title">Config</div>
            <div className="row">Model: {agentSessions?.model || '—'}</div>
            <div className="row">Heartbeat: {heartbeatStatus || '—'}</div>
            <div className="row">Sessions: {agentSessions?.sessions?.length || 0}</div>
          </div>
        </div>

        {/* Sessions Detail */}
        {agentSessions?.sessions?.length > 0 && (
          <div className="section">
            <div className="section-title">Active Sessions</div>
            {agentSessions.sessions.map((s, i) => (
              <div className="session-card" key={i}>
                <div className="row" style={{ borderBottom: 'none' }}>
                  <StatusDot ok={true} />
                  <span style={{ flex: 1 }}>{s.kind} — {s.model}</span>
                  <span style={{ color: '#555', fontSize: '10px' }}>{s.age}</span>
                </div>
                <div className="ctx-bar">
                  <div className="ctx-fill" style={{
                    width: `${s.contextPct || 0}%`,
                    background: (s.contextPct || 0) > 80 ? '#ef4444' : (s.contextPct || 0) > 50 ? '#f59e0b' : '#10b981'
                  }}></div>
                </div>
                <div className="session-meta">
                  {s.tokensUsed}/{s.tokensMax} tokens ({s.contextPct}%) · {s.cachePct != null ? `${s.cachePct}% cached` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audit Details */}
        {report?.lines?.length > 0 && (
          <div className="section">
            <div className="section-title">Audit Trail</div>
            <div className="card">
              {report.lines.map((line, i) => {
                const isPass = /✅/.test(line)
                const isFail = /❌/.test(line)
                const isWarn = /⚠️/.test(line)
                return (
                  <div className="row" key={i}>
                    <StatusDot ok={isPass ? true : isFail ? false : isWarn ? 'warn' : null} />
                    {line.replace(/^[✅❌⚠️]\s*/, '')}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Full Report */}
        {fullReport && (
          <div className="section">
            <div className="section-title">Full Report</div>
            <div className="full-report">
              <pre>{fullReport}</pre>
            </div>
          </div>
        )}

        {/* Health Notes */}
        {agentHealth?.notes?.length > 0 && (
          <div className="section">
            <div className="section-title">Health Notes</div>
            <div className="card">
              {agentHealth.notes.map((note, i) => (
                <div className="row" key={i} style={{ color: '#f59e0b' }}>⚠️ {note}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
