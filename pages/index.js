import Head from 'next/head'
import { useState, useEffect } from 'react'
import { buildPageProps } from '../lib/dashboard-data'
import { formatDashboardDateTime } from '../lib/date-format'

function useSnapshot(initialData, interval = 30000) {
  const [data, setData] = useState(initialData || null)
  useEffect(() => {
    const load = () => fetch('/api/data').then(r => r.json()).then(setData).catch(() => {})
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [interval])
  return data
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}

function timeAgo(dateStr) {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function statusColor(status) {
  if (status === 'ok' || status === 'ready') return '#10b981'
  if (status === 'manual' || status === 'in-progress') return '#3b82f6'
  if (status === 'blocked' || status === 'fail') return '#ef4444'
  if (status === 'warn') return '#f59e0b'
  return '#555'
}

export default function Dashboard({ initialSnapshot }) {
  const snap = useSnapshot(initialSnapshot)
  const hydrated = useHydrated()
  const [actionFeedback, setActionFeedback] = useState(null)

  const handleAction = async (id, action) => {
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })
      const data = await res.json()
      if (data.success) {
        setActionFeedback(`${action}: ${id}`)
        setTimeout(() => setActionFeedback(null), 2000)
      }
    } catch {}
  }

  const now = hydrated ? formatDashboardDateTime(new Date()) : ''
  const staleMinutes = hydrated && snap?.timestamp ? Math.floor((Date.now() - new Date(snap.timestamp).getTime()) / 60000) : null
  const isStale = staleMinutes !== null && staleMinutes > 60 * 24 * 7
  const projects = snap?.projects || []
  const blocked = projects.filter(p => p.status === 'blocked')
  const manual = projects.filter(p => p.source === 'manual-status-json')
  const aq = snap?.actionQueue
  const pendingItems = aq?.items?.filter(i => i.status === 'pending') || []
  const overdueItems = pendingItems.filter(i => i.overdue)

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Adam's Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080a;color:#e0e0e0;padding:16px 20px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px}
          h1{font-size:18px;color:#fff}
          .meta{font-size:9px;color:#888}
          .stale{color:#ef4444 !important}
          .live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px;animation:pulse 2s infinite}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
          .nav{display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .nav::-webkit-scrollbar{display:none}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px;white-space:nowrap;flex-shrink:0}
          .nav a:hover{border-color:#3b82f6}
          .strip{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
          .strip-item{background:#0d0d10;border:1px solid #1a1a22;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;flex:1;min-width:120px}
          .strip-val{font-size:18px;font-weight:800}
          .strip-lbl{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:0.8px}
          .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:14px}
          @media(max-width:600px){.cards{grid-template-columns:1fr}}
          .acard{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px;transition:all .2s}
          .acard:hover{border-color:#3b82f6;transform:translateY(-1px)}
          .acard-top{display:flex;align-items:center;gap:6px;margin-bottom:6px}
          .acard-name{font-size:13px;font-weight:700;color:#fff;flex:1}
          .acard-status{width:8px;height:8px;border-radius:50%}
          .acard-goal{font-size:10px;color:#aaa;margin-bottom:8px;line-height:1.4}
          .acard-build{background:#0a0a0d;border:1px solid #151518;border-radius:6px;padding:8px;margin-bottom:8px}
          .build-label{font-size:7px;color:#888;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;font-weight:700}
          .build-text{font-size:10px;color:#ccc;line-height:1.4}
          .acard-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin-bottom:6px}
          .acard-stat{text-align:center;background:#0a0a0d;border-radius:4px;padding:6px 4px}
          .acard-stat-val{font-size:14px;font-weight:800}
          .acard-stat-lbl{font-size:6px;color:#999;text-transform:uppercase;letter-spacing:0.5px}
          .acard-footer{display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#888;padding-top:4px;border-top:1px solid #151518}
          .aq{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px;margin-bottom:14px}
          .sec-t{font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:3px}
          .aq-row{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #111;align-items:center;font-size:10px}
          .aq-row:last-child{border-bottom:none}
          .aq-src{font-size:8px;color:#3b82f6;font-weight:600;min-width:70px;text-transform:uppercase}
          .aq-text{color:#aaa;flex:1}
          .aq-overdue{color:#ef4444 !important;font-weight:600}
          .badge{font-size:7px;padding:1px 5px;border-radius:4px;font-weight:600}
          .badge.overdue{background:#3b1010;color:#ef4444}
          .badge.high{background:#2a2000;color:#f59e0b}
          .aq-btns{display:flex;gap:3px;flex-shrink:0}
          .aq-btn{font-size:8px;padding:2px 6px;border-radius:4px;border:1px solid #333;background:#1a1a1a;color:#888;cursor:pointer;font-weight:600;transition:all .15s}
          .aq-btn:hover{border-color:#999;color:#fff}
          .aq-btn.complete{color:#3b82f6;border-color:#3b82f6}.aq-btn.complete:hover{background:#0e1a2e}
          .aq-btn.snooze{color:#f59e0b;border-color:#f59e0b}.aq-btn.snooze:hover{background:#2a2000}
          .footer{font-size:8px;color:#333;text-align:right;margin-top:16px}
          @media(max-width:480px){
            body{padding:10px 12px}
            h1{font-size:15px}
            .strip-item{min-width:calc(50% - 4px);padding:6px 10px}
            .strip-val{font-size:16px}
            .aq-row{flex-wrap:wrap;gap:4px}
            .aq-src{min-width:auto}
            .aq-text{min-width:100%;order:3}
            .aq-btns{order:4;width:100%;justify-content:flex-end;margin-top:2px}
          }
        `}</style>
      </Head>

      <div>
        <div className="top">
          <div>
            <span className="live-dot" style={{ background: isStale ? '#ef4444' : '#10b981' }}></span>
            <h1>Adam's Command Centre</h1>
          </div>
          <span className={`meta ${isStale ? 'stale' : ''}`}>
            {hydrated ? `${now} · ` : ''}{isStale ? `STALE (${staleMinutes}m)` : 'Manual data'} · Updated {hydrated && snap?.timestamp ? timeAgo(snap.timestamp) : '-'}
          </span>
        </div>

        <div className="nav">
          <a href="/bts-seo">BTS SEO</a>
          <a href="/nbhw-seo">NBHW SEO</a>
          <a href="/cairr-finance">CAIRR Finance</a>
        </div>

        <div className="strip">
          <div className="strip-item">
            <div>
              <div className="strip-val" style={{ color: blocked.length > 0 ? '#ef4444' : '#10b981' }}>{blocked.length}</div>
              <div className="strip-lbl">Blocked Projects</div>
            </div>
          </div>
          <div className="strip-item">
            <div>
              <div className="strip-val" style={{ color: '#3b82f6' }}>{manual.length}</div>
              <div className="strip-lbl">Manual Status Files</div>
            </div>
          </div>
          <div className="strip-item">
            <div>
              <div className="strip-val" style={{ color: overdueItems.length > 0 ? '#ef4444' : '#10b981' }}>{pendingItems.length}</div>
              <div className="strip-lbl">Action Queue {overdueItems.length > 0 ? `(${overdueItems.length} overdue)` : ''}</div>
            </div>
          </div>
          <div className="strip-item">
            <div>
              <div className="strip-val" style={{ color: snap?.dataSource?.agentSnapshot === false ? '#10b981' : '#ef4444' }}>OK</div>
              <div className="strip-lbl">Agent Snapshot Removed</div>
            </div>
          </div>
        </div>

        <div className="cards">
          {projects.map(project => {
            const color = statusColor(project.status)
            return (
              <a href={project.href} key={project.id} style={{ textDecoration: 'none' }}>
                <div className="acard">
                  <div className="acard-top">
                    <span className="acard-name">{project.label}</span>
                    <div className="acard-status" style={{ background: color }}></div>
                  </div>
                  <div className="acard-goal">{project.summary || 'No summary recorded.'}</div>

                  <div className="acard-build">
                    <div className="build-label">Current Status</div>
                    <div className="build-text" style={{ color }}>{project.statusLabel}</div>
                    <div className="build-label" style={{ marginTop: 8 }}>Source</div>
                    <div className="build-text">{project.source} · updated {hydrated ? timeAgo(project.lastUpdated) : '-'}</div>
                  </div>

                  <div className="acard-stats">
                    {(project.metrics || []).slice(0, 4).map(metric => (
                      <div className="acard-stat" key={metric.label}>
                        <div className="acard-stat-val" style={{ color: '#e0e0e0' }}>{metric.value}{metric.unit || ''}</div>
                        <div className="acard-stat-lbl">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="acard-build">
                    <div className="build-label">Needs Attention</div>
                    {(project.blockers || []).length === 0 && <div className="build-text" style={{ color: '#555' }}>No blockers recorded</div>}
                    {(project.blockers || []).slice(0, 3).map(item => (
                      <div className="build-text" key={item}>- {item}</div>
                    ))}
                  </div>

                  <div className="acard-footer">
                    <span>{project.id}</span>
                    <span>{hydrated ? timeAgo(project.lastUpdated) : '-'}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        <div className="aq">
          <div className="sec-t">
            Action Queue - {pendingItems.length} pending
            {overdueItems.length > 0 && <span style={{ color: '#ef4444', marginLeft: 8 }}>{overdueItems.length} overdue</span>}
            {actionFeedback && <span style={{ color: '#3b82f6', marginLeft: 8 }}>{actionFeedback}</span>}
          </div>
          {pendingItems.length === 0 && <div style={{ color: '#333', fontSize: 10, fontStyle: 'italic' }}>No pending items</div>}
          {[...pendingItems]
            .sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0) || (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
            .map(item => (
              <div className="aq-row" key={item.id}>
                <span className="aq-src">{item.source}</span>
                <span className={`aq-text ${item.overdue ? 'aq-overdue' : ''}`}>{item.title}</span>
                {item.overdue && <span className="badge overdue">OVERDUE</span>}
                {!item.overdue && item.priority === 'high' && <span className="badge high">HIGH</span>}
                <div className="aq-btns">
                  <button className="aq-btn complete" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'complete') }}>Done</button>
                  {item.overdue && <button className="aq-btn snooze" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'snooze') }}>+24h</button>}
                </div>
              </div>
            ))}
        </div>

        <div className="footer">Command Centre · manual status JSON · {hydrated && snap?.timestamp ? timeAgo(snap.timestamp) : 'No data'}</div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      initialSnapshot: buildPageProps(['actionQueue', 'dataSource', 'projects', 'timestamp'])
    }
  }
}
