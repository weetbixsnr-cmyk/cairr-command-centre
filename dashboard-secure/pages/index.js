import Head from 'next/head'
import { useState, useEffect } from 'react'

function useApi(url, interval = 30000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    const load = () => fetch(url).then(r => r.json()).then(setData).catch(setError)
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [url, interval])
  return { data, error }
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function StatusDot({ status }) {
  const cls = status === 'ok' || status === true ? 'g'
    : status === 'warn' ? 'y'
    : status === 'fail' || status === false ? 're'
    : 'x'
  return <span className={`d ${cls}`}></span>
}

export default function Dashboard() {
  const fleet = useApi('/api/fleet-health')
  const gov = useApi('/api/governance')
  const queue = useApi('/api/action-queue')
  const agents = useApi('/api/agents')
  const system = useApi('/api/system')
  const sessions = useApi('/api/sessions')
  const crons = useApi('/api/crons')

  const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // Derive health percentage
  const healthPct = fleet.data?.pct ?? '—'
  const healthColor = healthPct >= 90 ? '#10b981' : healthPct >= 70 ? '#f59e0b' : '#ef4444'

  // Count issues
  const criticalCount = (queue.data?.overdueCount || 0) + (fleet.data?.agents?.filter(a => !a.healthy).length || 0)
  const warnCount = queue.data?.highPriority || 0
  const passCount = fleet.data?.healthy || 0

  // Agent reports sorted by last updated
  const reportList = agents.data?.reports
    ? Object.entries(agents.data.reports)
        .filter(([k]) => !['fleet-health', 'governance-drift', 'infra-status'].includes(k))
        .sort((a, b) => new Date(b[1]?.lastUpdated || 0) - new Date(a[1]?.lastUpdated || 0))
    : []

  // Pending action items
  const pendingItems = queue.data?.items?.filter(i => i.status === 'pending') || []
  const overdueItems = pendingItems.filter(i => i.overdue)

  // System channels
  const channels = system.data?.gateway?.channels || []

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Adam's Command Centre</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 16px; }
          
          h1 { font-size: 18px; color: #fff; display: inline; }
          .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .meta { font-size: 9px; color: #444; }
          .live-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-right: 6px; animation: pulse 2s infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          
          .grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: auto; gap: 10px; }
          
          @media (max-width: 768px) {
            body { padding: 12px; font-size: 16px; }
            .grid { grid-template-columns: 1fr; gap: 16px; }
            .health-card { grid-column: 1; flex-direction: column; padding: 20px; }
            .health-pct { font-size: 36px !important; }
            .health-lbl { font-size: 14px !important; }
            .pill { font-size: 12px !important; padding: 6px 12px !important; }
            .health-card > div:last-child { border-left: none; border-top: 1px solid #222; padding-left: 0; padding-top: 16px; margin-left: 0; margin-top: 16px; }
            .reports-card { grid-column: 1; max-height: 300px; padding: 20px; }
            .action-card { grid-column: 1; padding: 20px; }
            .dates-inner { flex-direction: column; gap: 20px; }
            .dates-right { border-left: none; border-top: 1px solid #1a1a1a; padding-left: 0; padding-top: 20px; }
            .fleet-card { grid-column: 1; padding: 20px; }
            .personal { grid-column: 1; padding: 20px; }
            .p-grid { grid-template-columns: 1fr; gap: 16px; }
            h1 { font-size: 20px !important; }
            .meta { font-size: 12px !important; }
            .card { padding: 20px !important; }
            .card-name { font-size: 16px !important; }
            .sec-t { font-size: 12px !important; }
            .r { font-size: 14px !important; }
          }
          
          @media (max-width: 480px) {
            body { padding: 16px; font-size: 18px; }
            .grid { gap: 20px; }
            .card { padding: 24px 20px !important; min-height: auto; }
            .health-card { padding: 24px 20px !important; }
            .reports-card { padding: 24px 20px !important; max-height: 400px; }
            .action-card { padding: 24px 20px !important; }
            .fleet-card { padding: 24px 20px !important; }
            .personal { padding: 24px 20px !important; }
            h1 { font-size: 24px !important; }
            .health-pct { font-size: 48px !important; }
            .health-lbl { font-size: 16px !important; }
            .pills { flex-wrap: wrap; gap: 8px; }
            .pill { font-size: 14px !important; padding: 8px 16px !important; }
            .card-name { font-size: 18px !important; }
            .r { font-size: 16px !important; }
            .sec-t { font-size: 14px !important; }
          }
          
          .health-card { grid-column: 1 / 3; background: #111; border: 1px solid #222; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
          .health-pct { font-size: 28px; font-weight: 700; }
          .health-lbl { font-size: 10px; color: #555; margin-bottom: 4px; }
          .pills { display: flex; gap: 5px; }
          .pill { font-size: 9px; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
          .pill.r { background: #3b1010; color: #ef4444; }
          .pill.y { background: #2a2000; color: #f59e0b; }
          .pill.g { background: #0a2a1a; color: #10b981; }
          
          .reports-card { grid-column: 3 / 5; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; overflow-y: auto; align-self: start; max-height: 200px; }
          .rpt-row { display: flex; align-items: center; gap: 6px; padding: 3px 0; border-bottom: 1px solid #1a1a1a; }
          .rpt-row:last-child { border-bottom: none; }
          .rpt-status { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
          .rpt-status.ok { background: #10b981; }
          .rpt-status.warn { background: #f59e0b; }
          .rpt-status.fail { background: #ef4444; }

          .action-card { grid-column: 5 / 8; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; align-self: start; max-height: 250px; overflow-y: auto; }
          .action-title { font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .action-row { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px solid #1a1a1a; align-items: baseline; }
          .action-row:last-child { border-bottom: none; }
          .action-source { font-size: 8px; color: #3b82f6; font-weight: 600; min-width: 50px; text-transform: uppercase; }
          .action-text { font-size: 10px; color: #aaa; flex: 1; }
          .action-overdue { color: #ef4444 !important; font-weight: 600; }
          .action-badge { font-size: 7px; padding: 1px 5px; border-radius: 4px; font-weight: 600; }
          .action-badge.overdue { background: #3b1010; color: #ef4444; }
          .action-badge.high { background: #2a2000; color: #f59e0b; }
          
          .fleet-card { grid-column: 1 / 4; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; }
          .fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; margin-top: 6px; }
          .fleet-agent { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: #0a0a0a; border-radius: 6px; border: 1px solid #1a1a1a; }
          .fleet-agent.unhealthy { border-color: #ef4444; }
          .fleet-name { font-size: 10px; color: #ccc; }
          .fleet-status { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
          .fleet-status.ok { background: #10b981; }
          .fleet-status.fail { background: #ef4444; }

          .gov-card { grid-column: 4 / 6; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; }
          .sys-card { grid-column: 6 / 8; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; }
          
          .sec-t { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; margin-top: 8px; font-weight: 600; border-bottom: 1px solid #1a1a1a; padding-bottom: 3px; }
          .sec-t:first-of-type { margin-top: 0; }
          .r { font-size: 10px; color: #aaa; padding: 2.5px 0; display: flex; align-items: baseline; gap: 4px; line-height: 1.5; }
          .d { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
          .d.g { background: #10b981; }
          .d.y { background: #f59e0b; }
          .d.re { background: #ef4444; }
          .d.b { background: #3b82f6; }
          .d.x { background: #333; }
          
          .tag { font-size: 7px; padding: 2px 5px; border-radius: 5px; font-weight: 600; }
          .tag.live { background: #0a2a1a; color: #10b981; border: 1px solid #10b981; }
          .tag.warn { background: #2a2000; color: #f59e0b; border: 1px solid #f59e0b; }
          .tag.fail { background: #3b1010; color: #ef4444; border: 1px solid #ef4444; }
          
          .token-card { grid-column: 1 / 4; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; }
          .token-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 6px; margin-top: 6px; }
          .token-agent { padding: 6px 8px; background: #0a0a0a; border-radius: 6px; border: 1px solid #1a1a1a; }
          .token-name { font-size: 9px; color: #888; margin-bottom: 2px; }
          .token-pct { font-size: 14px; font-weight: 700; }
          .token-bar { height: 3px; background: #1a1a1a; border-radius: 2px; margin-top: 3px; overflow: hidden; }
          .token-fill { height: 100%; border-radius: 2px; }
          
          .cron-card { grid-column: 4 / 6; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; max-height: 200px; overflow-y: auto; }
          .cron-stat { display: flex; gap: 8px; margin-bottom: 6px; }
          .cron-num { font-size: 20px; font-weight: 700; }
          .cron-lbl { font-size: 9px; color: #555; }
          .cron-row { font-size: 9px; color: #3b82f6; padding: 2px 0; display: flex; align-items: center; gap: 4px; }
          .cron-row .cron-time { font-weight: 600; min-width: 50px; }
          .cron-row .cron-name { color: #5b9cf6; }
          
          .nav-card { grid-column: 6 / 8; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; }
          .nav-link { display: block; padding: 8px 10px; margin-bottom: 4px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 6px; color: #3b82f6; text-decoration: none; font-size: 11px; transition: border-color 0.2s; }
          .nav-link:hover { border-color: #3b82f6; }
          .nav-desc { font-size: 8px; color: #555; margin-top: 2px; }
          
          .footer { font-size: 8px; color: #222; text-align: right; margin-top: 12px; }
          .loading { color: #333; font-size: 10px; font-style: italic; }
        `}</style>
      </Head>

      <div>
        <div className="top">
          <div>
            <span className="live-dot"></span>
            <h1>🎯 Adam's Command Centre</h1>
          </div>
          <span className="meta">{now} · Live · Overwatch</span>
        </div>

        <div className="grid">
          {/* Health Card */}
          <div className="health-card">
            <div>
              <span className="health-pct" style={{ color: healthColor }}>
                {healthPct}{typeof healthPct === 'number' ? '%' : ''}
              </span>
              <div className="health-lbl">Fleet Health</div>
              <div className="pills">
                {criticalCount > 0 && <span className="pill r">{criticalCount} Critical</span>}
                {warnCount > 0 && <span className="pill y">{warnCount} High Priority</span>}
                <span className="pill g">{passCount} Healthy</span>
              </div>
            </div>
            <div style={{borderLeft:'1px solid #222', paddingLeft:'12px', marginLeft:'auto'}}>
              <div style={{fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>System</div>
              <div style={{fontSize:'10px', color: system.data?.gateway?.status === 'running' ? '#10b981' : '#ef4444'}}>
                ● Gateway {system.data?.gateway?.status || 'checking...'}
              </div>
              {channels.map((ch, i) => (
                <div key={i} style={{fontSize:'9px', color: ch.state === 'OK' ? '#666' : '#f59e0b', marginTop:'2px'}}>
                  {ch.name}: {ch.state}
                </div>
              ))}
              <div style={{fontSize:'9px', color:'#333', marginTop:'2px'}}>
                Heartbeats: all disabled
              </div>
            </div>
          </div>

          {/* Reports Card */}
          <div className="reports-card">
            <div style={{fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px'}}>
              Agent Reports ({reportList.length})
            </div>
            {reportList.length === 0 && <div className="loading">Loading...</div>}
            {reportList.map(([key, report]) => {
              const status = report.fail > 0 ? 'fail' : report.warn > 0 ? 'warn' : 'ok'
              return (
                <div className="rpt-row" key={key}>
                  <span className={`rpt-status ${status}`}></span>
                  <span style={{fontSize:'10px', flex:'1'}}>
                    {key.replace(/-/g, ' ')} — {timeAgo(report.lastUpdated)}
                    {report.fail > 0 ? ' ❌' : report.warn > 0 ? ' ⚠️' : ' ✅'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Action Queue Card */}
          <div className="action-card">
            <div className="action-title">
              Action Queue — {pendingItems.length} pending
              {overdueItems.length > 0 && <span style={{color:'#ef4444', marginLeft:'8px'}}>🔴 {overdueItems.length} overdue</span>}
            </div>
            {pendingItems.length === 0 && <div className="loading">No pending items</div>}
            {/* Show overdue first, then by priority */}
            {[...pendingItems]
              .sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0) || (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
              .map(item => (
                <div className="action-row" key={item.id}>
                  <span className="action-source">{item.source}</span>
                  <span className={`action-text ${item.overdue ? 'action-overdue' : ''}`}>{item.title}</span>
                  {item.overdue && <span className="action-badge overdue">OVERDUE</span>}
                  {!item.overdue && item.priority === 'high' && <span className="action-badge high">HIGH</span>}
                </div>
              ))}
          </div>

          {/* Token Spend Card */}
          <div className="token-card">
            <div className="sec-t">Context Usage by Agent</div>
            {!sessions.data && <div className="loading">Loading...</div>}
            <div className="token-grid">
              {sessions.data?.byAgent && Object.entries(sessions.data.byAgent).map(([name, data]) => {
                const pct = data.avgContextPct || 0
                const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
                return (
                  <a href={`/agent/${name}`} key={name} style={{ textDecoration: 'none' }}>
                    <div className="token-agent">
                      <div className="token-name">{name}</div>
                      <div className="token-pct" style={{ color }}>{pct}%</div>
                      <div className="token-bar"><div className="token-fill" style={{ width: `${pct}%`, background: color }}></div></div>
                    </div>
                  </a>
                )
              })}
            </div>
            <div style={{fontSize:'8px', color:'#333', marginTop:'6px'}}>
              {sessions.data?.totalSessions || 0} active sessions across {sessions.data?.totalAgents || 0} agents
            </div>
          </div>

          {/* Cron Jobs Card */}
          <div className="cron-card">
            <div className="sec-t">Cron Jobs</div>
            <div className="cron-stat">
              <div>
                <div className="cron-num" style={{ color: '#10b981' }}>{crons.data?.active || 0}</div>
                <div className="cron-lbl">Active</div>
              </div>
              <div>
                <div className="cron-num" style={{ color: '#555' }}>{crons.data?.disabled || 0}</div>
                <div className="cron-lbl">Disabled</div>
              </div>
              {(crons.data?.errors || 0) > 0 && (
                <div>
                  <div className="cron-num" style={{ color: '#ef4444' }}>{crons.data.errors}</div>
                  <div className="cron-lbl">Errors</div>
                </div>
              )}
            </div>
            {crons.data?.jobs?.slice(0, 8).map((job, i) => (
              <div className="cron-row" key={i}>
                <span style={{ color: job.status === 'active' ? '#10b981' : job.status === 'error' ? '#ef4444' : '#333' }}>●</span>
                <span className="cron-time">{job.schedule || '—'}</span>
                <span className="cron-name">{job.name}</span>
              </div>
            ))}
          </div>

          {/* Navigation Card */}
          <div className="nav-card">
            <div className="sec-t">Views</div>
            <a href="/fleet" className="nav-link">
              🏢 Fleet — Office Floor
              <div className="nav-desc">All agents, groups, connections</div>
            </a>
            {fleet.data?.agents?.slice(0, 4).map(agent => (
              <a href={`/agent/${agent.name}`} className="nav-link" key={agent.name}>
                {agent.healthy ? '🟢' : '🔴'} {agent.name}
                <div className="nav-desc">Pipeline, sessions, audit trail</div>
              </a>
            ))}
          </div>

          {/* Fleet Agents Card */}
          <div className="fleet-card">
            <div className="sec-t">Fleet Agents</div>
            {!fleet.data && <div className="loading">Loading...</div>}
            <div className="fleet-grid">
              {fleet.data?.agents?.map(agent => (
                <a href={`/agent/${agent.name}`} key={agent.name} style={{ textDecoration: 'none' }}>
                  <div className={`fleet-agent ${!agent.healthy ? 'unhealthy' : ''}`}>
                    <span className={`fleet-status ${agent.healthy ? 'ok' : 'fail'}`}></span>
                    <span className="fleet-name">{agent.name}</span>
                  </div>
                </a>
              ))}
            </div>
            {fleet.data && (
              <div style={{fontSize:'8px', color:'#333', marginTop:'6px'}}>
                Last scan: {fleet.data.title?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '—'}
              </div>
            )}
          </div>

          {/* Governance Card */}
          <div className="gov-card">
            <div className="sec-t">Governance</div>
            {!gov.data && <div className="loading">Loading...</div>}
            {gov.data && (
              <>
                <div className="r">
                  <StatusDot status={gov.data.ok === gov.data.total ? 'ok' : 'warn'} />
                  {gov.data.ok}/{gov.data.total} agents locked
                </div>
                {gov.data.agents?.filter(a => a.status !== 'ok').map(a => (
                  <div className="r" key={a.name}>
                    <StatusDot status={a.status} />
                    {a.name}: {a.detail}
                  </div>
                ))}
                <div style={{fontSize:'8px', color:'#333', marginTop:'6px'}}>
                  Last scan: {gov.data.title?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '—'}
                </div>
              </>
            )}
          </div>

          {/* System Card */}
          <div className="sys-card">
            <div className="sec-t">Infrastructure</div>
            {!system.data && <div className="loading">Loading...</div>}
            {system.data?.infra?.items?.map((item, i) => (
              <div className="r" key={i}>
                <StatusDot status={item.status} />
                {item.text}
              </div>
            ))}
            {system.data?.gateway?.agents && (
              <div className="r" style={{marginTop:'4px'}}>
                <StatusDot status="ok" />
                {system.data.gateway.agents}
              </div>
            )}
          </div>
        </div>

        <div className="footer">Overwatch 🎯 · Live Data · Auto-refresh 30s</div>
      </div>
    </>
  )
}
