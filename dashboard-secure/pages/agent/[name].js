import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

function useAgentData(name) {
  const [data, setData] = useState(null)
  const [snap, setSnap] = useState(null)
  useEffect(() => {
    if (!name) return
    // Get full agent data (includes full report)
    fetch(`/api/data?agent=${name}`).then(r => r.json()).then(setData).catch(() => {})
    // Get full snapshot for cross-references
    fetch('/api/data').then(r => r.json()).then(setSnap).catch(() => {})
    const id = setInterval(() => {
      fetch(`/api/data?agent=${name}`).then(r => r.json()).then(setData).catch(() => {})
      fetch('/api/data').then(r => r.json()).then(setSnap).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [name])
  return { agent: data, snap }
}

function timeAgo(d) {
  if (!d) return '—'
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'now'; if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Light({ ok }) {
  const c = ok === true ? '#10b981' : ok === false ? '#ef4444' : ok === 'warn' ? '#f59e0b' : '#333'
  return <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:c,flexShrink:0,marginRight:4}}></span>
}

function CtxBar({ pct, height = 6 }) {
  const c = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
  return <div style={{height,background:'#1a1a1a',borderRadius:height/2,marginTop:4,overflow:'hidden'}}>
    <div style={{height,width:`${pct}%`,background:c,borderRadius:height/2,transition:'width .3s'}}></div>
  </div>
}

export default function AgentPage() {
  const router = useRouter()
  const { name } = router.query
  const { agent, snap } = useAgentData(name)

  const health = agent?.health || snap?.fleetHealth?.agents?.find(a => a.name === name)
  const session = agent?.session || snap?.sessions?.byAgent?.[name]
  const hb = agent?.heartbeat || snap?.sessions?.heartbeats?.[name]
  const report = agent?.report || snap?.agentReports?.[name]
  const fullReport = agent?.fullReport
  const gov = agent?.governance || snap?.governance?.agents?.find(a => a.name === name)

  // Action queue items for this agent
  const agentActions = snap?.actionQueue?.items?.filter(i => i.source === name && i.status === 'pending') || []

  const handleAction = async (id, action) => {
    try {
      await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })
    } catch {}
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{name || 'Agent'} — Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:16px 24px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          .back{font-size:12px;margin-bottom:16px;display:inline-block}
          .header{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
          .header h1{font-size:22px;color:#fff}
          .tag{font-size:9px;padding:3px 8px;border-radius:5px;font-weight:600}
          .tag.ok{background:#0a2a1a;color:#10b981;border:1px solid #10b981}
          .tag.fail{background:#3b1010;color:#ef4444;border:1px solid #ef4444}
          .tag.warn{background:#2a2000;color:#f59e0b;border:1px solid #f59e0b}
          .tag.off{background:#1a1a1a;color:#555;border:1px solid #333}
          .grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:14px}
          @media(max-width:900px){.grid{grid-template-columns:1fr 1fr}}
          @media(max-width:600px){.grid{grid-template-columns:1fr}}
          .card{background:#111;border:1px solid #222;border-radius:10px;padding:12px}
          .card-title{font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600}
          .stat{font-size:24px;font-weight:700;margin-bottom:2px}
          .stat-lbl{font-size:10px;color:#555}
          .row{font-size:11px;color:#aaa;padding:4px 0;display:flex;align-items:center;gap:6px;border-bottom:1px solid #1a1a1a}
          .row:last-child{border-bottom:none}
          .section{margin-top:14px}
          .sec-title{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:4px}
          .session-card{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:8px;padding:10px;margin-top:6px}
          .session-meta{font-size:9px;color:#444;margin-top:4px}
          .full-report{background:#111;border:1px solid #222;border-radius:10px;padding:14px;margin-top:8px}
          .full-report pre{font-size:11px;color:#aaa;white-space:pre-wrap;word-break:break-word;line-height:1.6}
          .action-item{display:flex;gap:8px;padding:6px 0;border-bottom:1px solid #1a1a1a;align-items:baseline}
          .action-item:last-child{border-bottom:none}
          .badge{font-size:7px;padding:1px 5px;border-radius:4px;font-weight:600}
          .badge.overdue{background:#3b1010;color:#ef4444}
          .badge.high{background:#2a2000;color:#f59e0b}
          .process{background:#111;border:1px solid #222;border-radius:10px;padding:14px;margin-top:8px}
          .step{display:flex;align-items:center;gap:8px;padding:6px 0}
          .step-line{width:2px;height:20px;background:#222;margin-left:3px}
          .step-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
          .step-text{font-size:11px;color:#aaa}
        `}</style>
      </Head>

      <div>
        <a href="/" className="back">← Dashboard</a>
        <div className="header">
          <Light ok={health?.healthy} />
          <h1>{name || '...'}</h1>
          {health && <span className={`tag ${health.healthy?'ok':'fail'}`}>{health.healthy?'HEALTHY':'UNHEALTHY'}</span>}
          {hb && <span className={`tag ${hb==='disabled'?'off':hb==='ok'?'ok':'warn'}`}>HB: {hb}</span>}
          {gov && <span className={`tag ${gov.status==='ok'?'ok':'warn'}`}>GOV: {gov.status}</span>}
        </div>

        {/* Stats Grid */}
        <div className="grid">
          <div className="card">
            <div className="card-title">Context Usage</div>
            <div className="stat" style={{color: (session?.avgContextPct||0)>80?'#ef4444':(session?.avgContextPct||0)>50?'#f59e0b':'#10b981'}}>
              {session?.avgContextPct!=null ? `${session.avgContextPct}%` : '—'}
            </div>
            <div className="stat-lbl">avg across {session?.sessions?.length||0} session(s)</div>
            <CtxBar pct={session?.avgContextPct||0} />
          </div>

          <div className="card">
            <div className="card-title">Latest Audit</div>
            {report ? (
              <>
                <div className="row"><Light ok={report.fail===0} />{report.title}</div>
                <div className="row" style={{color:'#555'}}>Updated: {timeAgo(report.lastUpdated)}</div>
                <div className="row">✅ {report.pass} · ❌ {report.fail} · ⚠️ {report.warn}</div>
              </>
            ) : <div style={{color:'#555',fontSize:'11px'}}>No report</div>}
          </div>

          <div className="card">
            <div className="card-title">Config</div>
            <div className="row">Model: {session?.model||'—'}</div>
            <div className="row">Heartbeat: {hb||'—'}</div>
            <div className="row">Sessions: {session?.sessions?.length||0}</div>
            <div className="row">Governance: {gov?.detail||'—'}</div>
          </div>

          <div className="card">
            <div className="card-title">Health Notes</div>
            {health?.notes?.length > 0
              ? health.notes.map((n,i) => <div className="row" key={i} style={{color:'#f59e0b'}}>⚠️ {n}</div>)
              : <div style={{color:'#555',fontSize:'11px'}}>No issues</div>
            }
          </div>
        </div>

        {/* Agent Process Diagram */}
        <div className="section">
          <div className="sec-title">Agent Process</div>
          <div className="process">
            {[
              { label: 'Heartbeat trigger', status: hb === 'ok' ? true : hb === 'disabled' ? null : false },
              { label: 'Task execution', status: health?.healthy },
              { label: 'Self-review in dev/', status: true },
              { label: 'Audit gate', status: report ? report.fail === 0 : null },
              { label: 'Output to production', status: report?.fail === 0 && health?.healthy },
              { label: 'Brain cross-reference', status: true },
              { label: 'Dashboard update', status: true },
            ].map((step, i, arr) => (
              <div key={i}>
                <div className="step">
                  <div className="step-dot" style={{background: step.status === true ? '#10b981' : step.status === false ? '#ef4444' : '#333'}}></div>
                  <span className="step-text">{step.label}</span>
                </div>
                {i < arr.length - 1 && <div className="step-line"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        {session?.sessions?.length > 0 && (
          <div className="section">
            <div className="sec-title">Active Sessions</div>
            {session.sessions.map((s, i) => (
              <div className="session-card" key={i}>
                <div className="row" style={{borderBottom:'none'}}>
                  <Light ok={true} />
                  <span style={{flex:1}}>{s.kind} — {s.model}</span>
                  <span style={{color:'#555',fontSize:'10px'}}>{s.age}</span>
                </div>
                <CtxBar pct={s.contextPct||0} height={4} />
                <div className="session-meta">
                  {s.tokensUsed}/{s.tokensMax} ({s.contextPct}%) · {s.cachePct!=null?`${s.cachePct}% cached`:''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Queue for this agent */}
        {agentActions.length > 0 && (
          <div className="section">
            <div className="sec-title">Pending Actions ({agentActions.length})</div>
            <div className="card">
              {agentActions.map(item => (
                <div className="action-item" key={item.id}>
                  <span style={{fontSize:'10px',color:'#aaa',flex:1}}>{item.title}</span>
                  {item.overdue && <span className="badge overdue">OVERDUE</span>}
                  {!item.overdue && item.priority === 'high' && <span className="badge high">HIGH</span>}
                  <div style={{display:'flex',gap:3,flexShrink:0}}>
                    {item.type === 'approval' && (
                      <>
                        <button onClick={() => handleAction(item.id,'approve')} style={{fontSize:'8px',padding:'2px 6px',borderRadius:4,border:'1px solid #10b981',background:'transparent',color:'#10b981',cursor:'pointer'}}>✓</button>
                        <button onClick={() => handleAction(item.id,'reject')} style={{fontSize:'8px',padding:'2px 6px',borderRadius:4,border:'1px solid #ef4444',background:'transparent',color:'#ef4444',cursor:'pointer'}}>✗</button>
                      </>
                    )}
                    <button onClick={() => handleAction(item.id,'complete')} style={{fontSize:'8px',padding:'2px 6px',borderRadius:4,border:'1px solid #3b82f6',background:'transparent',color:'#3b82f6',cursor:'pointer'}}>Done</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Trail */}
        {report?.lines?.length > 0 && (
          <div className="section">
            <div className="sec-title">Audit Trail</div>
            <div className="card">
              {report.lines.map((line, i) => (
                <div className="row" key={i}>
                  <Light ok={/✅/.test(line) ? true : /❌/.test(line) ? false : /⚠️/.test(line) ? 'warn' : null} />
                  {line.replace(/^[✅❌⚠️]\s*/, '')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Report */}
        {fullReport && (
          <div className="section">
            <div className="sec-title">Full Report</div>
            <div className="full-report"><pre>{fullReport}</pre></div>
          </div>
        )}
      </div>
    </>
  )
}
