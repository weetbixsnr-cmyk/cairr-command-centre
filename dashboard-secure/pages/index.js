import Head from 'next/head'
import { useState, useEffect } from 'react'

function useSnapshot(interval = 30000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    const load = () => fetch('/api/data').then(r => r.json()).then(setData).catch(setError)
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [interval])
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
  return `${Math.floor(hrs / 24)}d ago`
}

function Light({ status }) {
  const color = status === 'ok' || status === true ? '#10b981'
    : status === 'warn' ? '#f59e0b'
    : status === 'fail' || status === false ? '#ef4444'
    : '#333'
  return <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }}></span>
}

function CtxBar({ pct }) {
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ height:3, background:'#1a1a1a', borderRadius:2, marginTop:3, overflow:'hidden' }}>
      <div style={{ height:3, width:`${pct}%`, background:color, borderRadius:2 }}></div>
    </div>
  )
}

export default function Dashboard() {
  const { data: snap } = useSnapshot()

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
        // Refresh snapshot to pick up change
        setTimeout(() => { setActionFeedback(null) }, 2000)
      }
    } catch {}
  }

  const now = new Date().toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  const staleMinutes = snap?.timestamp ? Math.floor((Date.now() - new Date(snap.timestamp).getTime()) / 60000) : null
  const isStale = staleMinutes !== null && staleMinutes > 10
  const isBundled = snap?._source === 'bundled'

  // Fleet health
  const fh = snap?.fleetHealth
  const healthPct = fh?.pct ?? '—'
  const healthColor = healthPct >= 90 ? '#10b981' : healthPct >= 70 ? '#f59e0b' : '#ef4444'

  // Action queue
  const aq = snap?.actionQueue
  const pendingItems = aq?.items?.filter(i => i.status === 'pending') || []
  const overdueItems = pendingItems.filter(i => i.overdue)

  // Agent reports
  const reportList = snap?.agentReports
    ? Object.entries(snap.agentReports)
        .sort((a, b) => new Date(b[1]?.lastUpdated || 0) - new Date(a[1]?.lastUpdated || 0))
    : []

  // Sessions
  const sess = snap?.sessions
  const gw = snap?.gateway

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Adam's Command Centre</title>
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#0a0a0a; color:#e0e0e0; padding:16px; }
          a { color:#3b82f6; text-decoration:none; }
          a:hover { text-decoration:underline; }
          h1 { font-size:18px; color:#fff; display:inline; }
          .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px; }
          .meta { font-size:9px; color:#444; }
          .stale { color:#ef4444 !important; font-weight:600; }
          .live-dot { display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:6px; animation:pulse 2s infinite; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          .nav { display:flex; gap:8px; margin-bottom:12px; }
          .nav a { font-size:10px; padding:4px 10px; background:#111; border:1px solid #222; border-radius:6px; }
          .nav a:hover { border-color:#3b82f6; }
          
          .grid { display:grid; grid-template-columns:repeat(7,1fr); grid-auto-rows:auto; gap:10px; }
          
          @media(max-width:768px) {
            .grid { grid-template-columns:1fr; gap:16px; }
            .health-card,.reports-card,.action-card,.cron-card,.fleet-card,.gov-card,.sys-card,.eos-card { grid-column:1 !important; }
            body { padding:12px; }
            h1 { font-size:20px !important; }
            .meta { font-size:12px !important; }
          }
          @media(max-width:480px) {
            body { padding:16px; }
            .grid { gap:20px; }
            h1 { font-size:24px !important; }
          }

          .health-card { grid-column:1/3; background:#111; border:1px solid #222; border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
          .health-pct { font-size:28px; font-weight:700; }
          .health-lbl { font-size:10px; color:#555; margin-bottom:4px; }
          .pills { display:flex; gap:5px; flex-wrap:wrap; }
          .pill { font-size:9px; padding:3px 8px; border-radius:6px; font-weight:600; }
          .pill.r { background:#3b1010; color:#ef4444; }
          .pill.y { background:#2a2000; color:#f59e0b; }
          .pill.g { background:#0a2a1a; color:#10b981; }

          .reports-card { grid-column:3/5; background:#111; border:1px solid #222; border-radius:10px; padding:10px 14px; overflow-y:auto; max-height:220px; }
          .rpt-row { display:flex; align-items:center; gap:6px; padding:3px 0; border-bottom:1px solid #1a1a1a; }
          .rpt-row:last-child { border-bottom:none; }

          .action-card { grid-column:5/8; background:#111; border:1px solid #222; border-radius:10px; padding:10px 14px; max-height:250px; overflow-y:auto; }
          .action-row { display:flex; gap:8px; padding:4px 0; border-bottom:1px solid #1a1a1a; align-items:baseline; }
          .action-row:last-child { border-bottom:none; }
          .action-src { font-size:8px; color:#3b82f6; font-weight:600; min-width:50px; text-transform:uppercase; }
          .action-text { font-size:10px; color:#aaa; flex:1; }
          .action-overdue { color:#ef4444 !important; font-weight:600; }
          .badge { font-size:7px; padding:1px 5px; border-radius:4px; font-weight:600; }
          .badge.overdue { background:#3b1010; color:#ef4444; }
          .badge.high { background:#2a2000; color:#f59e0b; }
          .action-btns { display:flex; gap:3px; flex-shrink:0; }
          .action-btn { font-size:8px; padding:2px 6px; border-radius:4px; border:1px solid #333; background:#1a1a1a; color:#888; cursor:pointer; font-weight:600; transition:all .15s; }
          .action-btn:hover { border-color:#555; color:#fff; }
          .action-btn.approve { color:#10b981; border-color:#10b981; } .action-btn.approve:hover { background:#0a2a1a; }
          .action-btn.reject { color:#ef4444; border-color:#ef4444; } .action-btn.reject:hover { background:#3b1010; }
          .action-btn.complete { color:#3b82f6; border-color:#3b82f6; } .action-btn.complete:hover { background:#0e1a2e; }
          .action-btn.snooze { color:#f59e0b; border-color:#f59e0b; } .action-btn.snooze:hover { background:#2a2000; }

          .cron-card { grid-column:1/4; background:#111; border:1px solid #222; border-radius:10px; padding:10px 14px; }
          .cron-stat { display:flex; gap:12px; margin-bottom:6px; }
          .cron-num { font-size:18px; font-weight:700; }
          .cron-lbl { font-size:9px; color:#555; }

          .fleet-card { grid-column:4/8; background:#111; border:1px solid #222; border-radius:10px; padding:10px 14px; }
          .fleet-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:4px; margin-top:6px; }
          .fleet-agent { display:flex; align-items:center; gap:4px; padding:3px 6px; background:#0a0a0a; border-radius:4px; border:1px solid #1a1a1a; cursor:pointer; transition:border-color .2s; }
          .fleet-agent:hover { border-color:#3b82f6; }
          .fleet-agent.bad { border-color:#ef4444; }

          .eos-card { grid-column:1/8; background:#0d0d0d; border:1px solid #1a1a1a; border-radius:10px; padding:12px 14px; }
          .eos-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:8px; margin-top:8px; }
          .eos-agent { background:#111; border:1px solid #222; border-radius:8px; padding:10px; }
          .eos-name { font-size:11px; font-weight:600; color:#fff; margin-bottom:4px; }
          .eos-row { font-size:9px; color:#888; padding:2px 0; display:flex; align-items:center; gap:4px; }

          .sec-t { font-size:9px; color:#666; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:4px; font-weight:600; border-bottom:1px solid #1a1a1a; padding-bottom:3px; }
          .r { font-size:10px; color:#aaa; padding:2px 0; display:flex; align-items:center; gap:4px; line-height:1.5; }
          .loading { color:#333; font-size:10px; font-style:italic; }
          .footer { font-size:8px; color:#222; text-align:right; margin-top:12px; }
        `}</style>
      </Head>

      <div>
        {/* Header */}
        <div className="top">
          <div>
            <span className="live-dot" style={{ background: isStale ? '#ef4444' : '#10b981' }}></span>
            <h1>🎯 Adam's Command Centre</h1>
          </div>
          <span className={`meta ${isStale || isBundled ? 'stale' : ''}`}>
            {now} · {isBundled ? '📦 BUNDLED (deploy-time snapshot — KV not connected)' : isStale ? `⚠️ DATA STALE (${staleMinutes}m old)` : 'Live'} · Last sync: {snap?.timestamp ? timeAgo(snap.timestamp) : '—'} · Overwatch
          </span>
        </div>

        {/* Nav */}
        <div className="nav">
          <a href="/fleet">🏢 Fleet View</a>
          <a href="/system">🔌 System Map</a>
          <a href="/nbhw-seo">🔧 NBHW SEO</a>
          <a href="/ricky">🧠 Ricky</a>
        </div>

        <div className="grid">
          {/* ── Row 1: Health / Reports / Action Queue ── */}
          
          {/* Health Card */}
          <div className="health-card">
            <div>
              <span className="health-pct" style={{ color: typeof healthPct === 'number' ? healthColor : '#555' }}>
                {healthPct}{typeof healthPct === 'number' ? '%' : ''}
              </span>
              <div className="health-lbl">Fleet Health</div>
              <div className="pills">
                {overdueItems.length > 0 && <span className="pill r">{overdueItems.length} Overdue</span>}
                {(fh?.total - fh?.healthy) > 0 && <span className="pill r">{fh.total - fh.healthy} Unhealthy</span>}
                {(aq?.highPriority || 0) > 0 && <span className="pill y">{aq.highPriority} High Priority</span>}
                <span className="pill g">{fh?.healthy || 0} Healthy</span>
              </div>
            </div>
            <div style={{borderLeft:'1px solid #222', paddingLeft:'12px', marginLeft:'auto'}}>
              <div style={{fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>Gateway</div>
              <div style={{fontSize:'10px', color: gw?.status === 'running' ? '#10b981' : '#ef4444'}}>
                ● {gw?.status || 'checking...'}
              </div>
              {gw?.channels?.map((ch, i) => (
                <div key={i} style={{fontSize:'9px', color: ch.state === 'OK' ? '#666' : '#f59e0b', marginTop:'2px'}}>
                  {ch.name}: {ch.state}
                </div>
              ))}
              <div style={{fontSize:'9px', color:'#333', marginTop:'2px'}}>
                {sess?.totalAgents || '?'} agents · {sess?.totalSessions || '?'} sessions
              </div>
            </div>
          </div>

          {/* Reports Card */}
          <div className="reports-card">
            <div className="sec-t">Agent Reports ({reportList.length})</div>
            {reportList.length === 0 && <div className="loading">Loading...</div>}
            {reportList.map(([key, rpt]) => {
              const status = rpt.fail > 0 ? 'fail' : rpt.warn > 0 ? 'warn' : 'ok'
              return (
                <a href={`/agent/${key}`} key={key} style={{ textDecoration:'none' }}>
                  <div className="rpt-row">
                    <Light status={status} />
                    <span style={{fontSize:'10px', flex:1, color:'#aaa'}}>
                      {key.replace(/-/g,' ')}
                    </span>
                    <span style={{fontSize:'8px', color:'#444'}}>{timeAgo(rpt.lastUpdated)}</span>
                  </div>
                </a>
              )
            })}
          </div>

          {/* Action Queue Card */}
          <div className="action-card">
            <div className="sec-t">
              Action Queue — {pendingItems.length} pending
              {overdueItems.length > 0 && <span style={{color:'#ef4444', marginLeft:'8px'}}>🔴 {overdueItems.length} overdue</span>}
            </div>
            {pendingItems.length === 0 && <div className="loading">No pending items</div>}
            {[...pendingItems]
              .sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0) || (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
              .map(item => (
                <div className="action-row" key={item.id}>
                  <span className="action-src">{item.source}</span>
                  <span className={`action-text ${item.overdue ? 'action-overdue' : ''}`}>{item.title}</span>
                  {item.overdue && <span className="badge overdue">OVERDUE</span>}
                  {!item.overdue && item.priority === 'high' && <span className="badge high">HIGH</span>}
                  <div className="action-btns">
                    {item.type === 'approval' && (
                      <>
                        <button className="action-btn approve" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'approve') }}>✓</button>
                        <button className="action-btn reject" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'reject') }}>✗</button>
                      </>
                    )}
                    <button className="action-btn complete" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'complete') }}>Done</button>
                    {item.overdue && <button className="action-btn snooze" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'snooze') }}>+24h</button>}
                  </div>
                </div>
              ))}
          </div>

          {/* ── Row 2: Crons / Fleet Grid ── */}

          {/* Cron Card */}
          <div className="cron-card">
            <div className="sec-t">Heartbeats & Crons</div>
            {sess?.heartbeats && (
              <div style={{marginBottom:'8px'}}>
                {Object.entries(sess.heartbeats).map(([name, status]) => (
                  <div key={name} className="r">
                    <Light status={status === 'ok' ? 'ok' : status === 'disabled' ? null : 'warn'} />
                    <span style={{fontSize:'9px'}}>{name}: {status}</span>
                  </div>
                ))}
              </div>
            )}
            {!sess?.heartbeats && <div className="loading">Loading...</div>}
          </div>

          {/* Fleet Grid */}
          <div className="fleet-card">
            <div className="sec-t">Fleet ({fh?.total || 0} agents)</div>
            <div className="fleet-grid">
              {fh?.agents?.map(agent => (
                <a href={`/agent/${agent.name}`} key={agent.name} style={{textDecoration:'none'}}>
                  <div className={`fleet-agent ${!agent.healthy ? 'bad' : ''}`}>
                    <Light status={agent.healthy} />
                    <span style={{fontSize:'9px', color:'#ccc'}}>{agent.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Row 3: EOS Scorecards ── */}
          <div className="eos-card">
            <div className="sec-t">Agent Scorecards</div>
            <div className="eos-grid">
              {fh?.agents?.map(agent => {
                const rpt = snap?.agentReports?.[agent.name]
                const agentSess = sess?.byAgent?.[agent.name]
                const hb = sess?.heartbeats?.[agent.name]
                const gov = snap?.governance?.agents?.find(a => a.name === agent.name)
                return (
                  <a href={`/agent/${agent.name}`} key={agent.name} style={{textDecoration:'none'}}>
                    <div className="eos-agent">
                      <div className="eos-name">
                        <Light status={agent.healthy} /> {agent.name}
                      </div>
                      <div className="eos-row"><Light status={agent.healthy} /> Health: {agent.healthy ? 'OK' : 'ISSUE'}</div>
                      <div className="eos-row"><Light status={gov?.status === 'ok'} /> Gov: {gov?.status || '—'}</div>
                      <div className="eos-row"><Light status={hb === 'ok' ? 'ok' : hb === 'disabled' ? null : 'warn'} /> HB: {hb || '—'}</div>
                      <div className="eos-row"><Light status={(agentSess?.avgContextPct || 0) < 80} /> Ctx: {agentSess?.avgContextPct ?? '—'}%</div>
                      {rpt && <div className="eos-row"><Light status={rpt.fail === 0} /> Audit: {rpt.pass}✅ {rpt.fail}❌ {rpt.warn}⚠️</div>}
                      {rpt && <div className="eos-row" style={{color:'#444'}}>Updated: {timeAgo(rpt.lastUpdated)}</div>}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>

          {/* ── Row 4: Quick Status / Personal Tasks ── */}
          <div className="eos-card" style={{gridColumn:'1/8'}}>
            <div className="sec-t">Quick Status</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:12,marginTop:8}}>
              <div>
                <div className="sec-t" style={{color:'#10b981',borderColor:'#0a2a1a'}}>CAIRR</div>
                <div className="r"><Light status="ok" /> Website ready</div>
                <div className="r"><Light status="ok" /> SEO automation live</div>
                <div className="r"><Light status="ok" /> Dashboard deployed</div>
              </div>
              <div>
                <div className="sec-t" style={{color:'#3b82f6',borderColor:'#0e1a2e'}}>Active Scans</div>
                <div className="r"><Light status="ok" /> NBHW SEO — Wave 1 active</div>
                <div className="r"><Light status="ok" /> Fleet monitoring live</div>
                <div className="r"><Light status={null} /> Property scan paused</div>
              </div>
              <div>
                <div className="sec-t" style={{color:'#f59e0b',borderColor:'#2a2000'}}>Clients</div>
                <div className="r"><Light status="ok" /> BTS: £300/mo ✅</div>
                <div className="r"><Light status="warn" /> TWPG: Pipeline</div>
                <div className="r"><Light status={null} /> Stone Plus: Early</div>
              </div>
              <div>
                <div className="sec-t" style={{color:'#ef4444',borderColor:'#3b1010'}}>Priority</div>
                {overdueItems.length > 0 
                  ? overdueItems.map(item => (
                      <div className="r" key={item.id}><Light status={false} /> {item.title.substring(0, 40)}{item.title.length > 40 ? '...' : ''}</div>
                    ))
                  : <div className="r"><Light status="ok" /> No overdue items</div>
                }
                {pendingItems.filter(i => i.priority === 'high' && !i.overdue).slice(0, 2).map(item => (
                  <div className="r" key={item.id}><Light status="warn" /> {item.title.substring(0, 40)}{item.title.length > 40 ? '...' : ''}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 5: Key Dates ── */}
          <div style={{gridColumn:'1/4',background:'#111',border:'1px solid #222',borderRadius:10,padding:'10px 14px'}}>
            <div className="sec-t">Key Dates</div>
            {pendingItems.filter(i => i.due_date).sort((a,b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 5).map(item => (
              <div key={item.id} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid #1a1a1a',fontSize:10}}>
                <span style={{color: item.overdue ? '#ef4444' : '#f59e0b',fontWeight:600,minWidth:60}}>
                  {item.overdue ? 'OVERDUE' : new Date(item.due_date).toLocaleDateString('en-AU',{day:'numeric',month:'short'})}
                </span>
                <span style={{color:'#888'}}>{item.title}</span>
              </div>
            ))}
            {pendingItems.filter(i => !i.due_date).length > 0 && (
              <div style={{fontSize:8,color:'#333',marginTop:4}}>{pendingItems.filter(i => !i.due_date).length} items without due dates</div>
            )}
          </div>

          {/* Reminders */}
          <div style={{gridColumn:'4/8',background:'#111',border:'1px solid #222',borderRadius:10,padding:'10px 14px'}}>
            <div className="sec-t">Reminders & Recurring</div>
            {pendingItems.filter(i => i.type === 'reminder').map(item => (
              <div key={item.id} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid #1a1a1a',fontSize:10}}>
                <span style={{color:'#3b82f6',fontWeight:600,minWidth:50,textTransform:'uppercase',fontSize:8}}>{item.source}</span>
                <span style={{color:'#888'}}>{item.title}</span>
              </div>
            ))}
            {pendingItems.filter(i => i.trigger).map(item => (
              <div key={item.id} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid #1a1a1a',fontSize:10}}>
                <span style={{color:'#a855f7',fontWeight:600,minWidth:50,fontSize:8}}>TRIGGER</span>
                <span style={{color:'#888'}}>{item.title}</span>
                <span style={{fontSize:8,color:'#555'}}>({item.trigger})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer">Overwatch 🎯 · Auto-refresh 30s · {snap?.timestamp ? `Snapshot: ${timeAgo(snap.timestamp)}` : 'No data'}</div>
      </div>
    </>
  )
}
