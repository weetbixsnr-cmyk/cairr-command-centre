import Head from 'next/head'
import { useState, useEffect } from 'react'

function useSnapshot(interval = 30000) {
  const [data, setData] = useState(null)
  useEffect(() => {
    const load = () => fetch('/api/data').then(r => r.json()).then(setData).catch(() => {})
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [interval])
  return data
}

function timeAgo(d) {
  if (!d) return '—'
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'now'; if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function Light({ ok }) {
  const c = ok === true ? '#10b981' : ok === false ? '#ef4444' : ok === 'warn' ? '#f59e0b' : '#333'
  return <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:c,flexShrink:0}}></span>
}

function CtxBar({ pct }) {
  const c = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
  return <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginTop:4}}>
    <div style={{height:4,width:`${pct}%`,background:c,borderRadius:2}}></div>
  </div>
}

const GROUPS = {
  'Core': ['main', 'command-centre', 'audit'],
  'CAIRR': ['bts', 'gridpilot'],
  'NBHW': ['nbhw', 'nbhw-accounts', 'overdue-office'],
  'Investments': ['property', 'v3dn', 'alpha'],
  'Governance': ['opt-compliance', 'opt-quality', 'opt-security'],
}

const DESCS = {
  'main':'Brain (Ricky-Jnr) — orchestrator','command-centre':'Overwatch — this dashboard','audit':'Audit — quality gates',
  'bts':'BTS — SEO/content (£300/mo)','gridpilot':'GridPilot — energy R&D',
  'nbhw':'NBHW — website/SEO','nbhw-accounts':'NBHW accounts','overdue-office':'Overdue job tracking',
  'property':'Property scanner','v3dn':'V3DN — crypto trading','alpha':'Alpha — property dashboard',
  'opt-compliance':'Compliance','opt-quality':'Quality','opt-security':'Security',
}

export default function FleetPage() {
  const snap = useSnapshot()
  const fh = snap?.fleetHealth
  const sess = snap?.sessions

  const agentMap = {}
  if (fh?.agents) for (const a of fh.agents) agentMap[a.name] = { healthy: a.healthy, notes: a.notes }
  if (sess?.byAgent) for (const [n, d] of Object.entries(sess.byAgent)) agentMap[n] = { ...agentMap[n], ...d }
  if (sess?.heartbeats) for (const [n, s] of Object.entries(sess.heartbeats)) agentMap[n] = { ...agentMap[n], heartbeat: s }
  if (snap?.governance?.agents) for (const a of snap.governance.agents) agentMap[a.name] = { ...agentMap[a.name], govStatus: a.status }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fleet — Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:16px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          .back{font-size:12px;margin-bottom:16px;display:inline-block}
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px}
          .header h1{font-size:20px;color:#fff}
          .summary{display:flex;gap:12px}
          .sum-item{padding:6px 12px;background:#111;border:1px solid #222;border-radius:8px;text-align:center}
          .sum-val{font-size:18px;font-weight:700}
          .sum-lbl{font-size:9px;color:#555;margin-top:2px}
          .group{margin-bottom:16px}
          .group-title{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #1a1a1a}
          .agent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}
          @media(max-width:600px){.agent-grid{grid-template-columns:1fr}}
          .card{background:#111;border:1px solid #222;border-radius:10px;padding:12px;cursor:pointer;transition:border-color .2s}
          .card:hover{border-color:#3b82f6}
          .card.bad{border-color:#ef4444}
          .card-top{display:flex;align-items:center;gap:6px;margin-bottom:4px}
          .card-name{font-size:13px;font-weight:600;color:#fff;flex:1}
          .card-desc{font-size:9px;color:#555;margin-bottom:6px}
          .card-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:8px;color:#666}
          .card-meta span{display:flex;align-items:center;gap:3px}
          .tag{font-size:7px;padding:2px 6px;border-radius:4px;font-weight:600}
          .tag.off{background:#1a1a1a;color:#555}
          .tag.on{background:#0a2a1a;color:#10b981}
          .tag.err{background:#3b1010;color:#ef4444}
        `}</style>
      </Head>

      <div>
        <a href="/" className="back">← Dashboard</a>
        <div className="header">
          <h1>🏢 Fleet — Office Floor</h1>
          <div className="summary">
            <div className="sum-item">
              <div className="sum-val" style={{color:'#10b981'}}>{sess?.totalAgents||'—'}</div>
              <div className="sum-lbl">Agents</div>
            </div>
            <div className="sum-item">
              <div className="sum-val" style={{color:'#3b82f6'}}>{sess?.totalSessions||'—'}</div>
              <div className="sum-lbl">Sessions</div>
            </div>
            <div className="sum-item">
              <div className="sum-val" style={{color:fh?.pct>=90?'#10b981':'#f59e0b'}}>{fh?.pct||'—'}%</div>
              <div className="sum-lbl">Health</div>
            </div>
          </div>
        </div>

        {Object.entries(GROUPS).map(([groupName, names]) => (
          <div className="group" key={groupName}>
            <div className="group-title">{groupName}</div>
            <div className="agent-grid">
              {names.map(name => {
                const a = agentMap[name] || {}
                const rpt = snap?.agentReports?.[name]
                return (
                  <a href={`/agent/${name}`} key={name} style={{textDecoration:'none'}}>
                    <div className={`card ${a.healthy===false?'bad':''}`}>
                      <div className="card-top">
                        <Light ok={a.healthy} />
                        <span className="card-name">{name}</span>
                        {a.heartbeat && (
                          <span className={`tag ${a.heartbeat==='disabled'?'off':a.heartbeat==='ok'?'on':'err'}`}>
                            HB:{a.heartbeat}
                          </span>
                        )}
                      </div>
                      <div className="card-desc">{DESCS[name]||''}</div>
                      {a.avgContextPct != null && <CtxBar pct={a.avgContextPct} />}
                      <div className="card-meta">
                        {a.model && <span>🤖 {a.model}</span>}
                        {a.sessions?.length>0 && <span>📡 {a.sessions.length} session{a.sessions.length!==1?'s':''}</span>}
                        {a.avgContextPct!=null && <span>📊 {a.avgContextPct}% ctx</span>}
                        {a.govStatus && <span>{a.govStatus==='ok'?'🔒':'⚠️'} gov</span>}
                        {rpt && <span>📝 {timeAgo(rpt.lastUpdated)}</span>}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
