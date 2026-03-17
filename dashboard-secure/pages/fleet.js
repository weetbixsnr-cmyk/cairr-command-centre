import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'

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
  if (m < 1) return 'now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

function hoursAgo(d) {
  if (!d) return Infinity
  return (Date.now() - new Date(d).getTime()) / 3600000
}

const AGENT_META = {
  'main': { label: 'Brain', emoji: '🧠', desc: 'Orchestrator', group: 'Core', goal: 'Coordinate all agents, enforce FRAMEWORK.md' },
  'command-centre': { label: 'Overwatch', emoji: '🎯', desc: 'Dashboard & Monitoring', group: 'Core', goal: 'Single pane of glass for Adam' },
  'audit': { label: 'Audit', emoji: '🔍', desc: 'Quality Gates', group: 'Core', goal: 'Review all agent work before deploy' },
  'nbhw': { label: 'NBHW', emoji: '🔧', desc: 'Plumbing Site & SEO', group: 'NBHW', goal: 'Rank #1 for NB suburb plumbing keywords' },
  'bts': { label: 'BTS', emoji: '🎓', desc: 'Training Site & SEO', group: 'CAIRR', goal: 'SEO & content for Better Training Solutions (£300/mo)' },
  'v3dn': { label: 'V3DN', emoji: '📊', desc: 'Crypto Trading', group: 'Investments', goal: 'Automated trading scripts, portfolio tracking' },
  'gridpilot': { label: 'GridPilot', emoji: '⚡', desc: 'Energy Platform R&D', group: 'CAIRR', goal: 'Energy platform research & prototype' },
  'alpha': { label: 'Alpha', emoji: '🏠', desc: 'Property Dashboard', group: 'Investments', goal: 'Property scanning & investment dashboard' },
  'property': { label: 'Property', emoji: '🏘️', desc: 'Property Scanner', group: 'Investments', goal: 'Find & evaluate property investment deals' },
  'overdue-office': { label: 'Overdue Office', emoji: '📋', desc: 'Job Tracking', group: 'NBHW', goal: 'Track overdue plumbing jobs & follow-ups' },
}

const PIPELINE_STAGES = ['dev/', 'audit', 'staging', 'review', 'approved', 'live']

function getAgentStatus(snap, name) {
  const sess = snap?.sessions?.byAgent?.[name]
  const hb = snap?.sessions?.heartbeats?.[name]
  const health = snap?.fleetHealth?.agents?.find(a => a.name === name)
  const ws = snap?.agentWorkspaces?.[name]
  const rpt = snap?.agentReports?.[name]
  const gov = snap?.governance?.agents?.find(a => a.name === name)

  const hasSessions = sess?.sessions?.length > 0
  const lastActive = ws?.git?.lastCommitAt || rpt?.lastUpdated
  const hAgo = hoursAgo(lastActive)
  
  let status = 'idle'
  if (health?.healthy === false) status = 'error'
  else if (hasSessions && hAgo < 1) status = 'active'
  else if (hAgo < 24) status = 'recent'
  else status = 'idle'

  return { sess, hb, health, ws, rpt, gov, status, lastActive, hasSessions }
}

function CtxBar({ pct }) {
  if (pct == null) return null
  const c = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
  return (
    <div className="ctx-bar-wrap">
      <div className="ctx-bar" style={{ width: `${pct}%`, background: c }}></div>
      <span className="ctx-label">{pct}%</span>
    </div>
  )
}

function PipelineStage({ stage }) {
  const idx = PIPELINE_STAGES.indexOf(stage)
  return (
    <div className="pipeline">
      {PIPELINE_STAGES.map((s, i) => (
        <div key={s} className={`pip-dot ${i <= idx ? 'pip-active' : ''} ${i === idx ? 'pip-current' : ''}`} title={s}>
          <div className="pip-inner"></div>
          <span className="pip-label">{s}</span>
        </div>
      ))}
    </div>
  )
}

function AgentDesk({ name, snap, onClick }) {
  const meta = AGENT_META[name] || { label: name, emoji: '🤖', desc: '', group: '?', goal: '' }
  const d = getAgentStatus(snap, name)
  
  return (
    <div className={`desk desk-${d.status}`} onClick={() => onClick(name)}>
      <div className="desk-pulse-ring"></div>
      <div className="desk-header">
        <span className="desk-emoji">{meta.emoji}</span>
        <span className="desk-name">{meta.label}</span>
        <span className={`desk-status-dot s-${d.status}`}></span>
      </div>
      
      <div className="desk-desc">{meta.desc}</div>
      
      {d.sess?.model && <div className="desk-model">{d.sess.model.split('/').pop().replace('claude-', '')}</div>}
      
      <CtxBar pct={d.sess?.avgContextPct} />
      
      <div className="desk-goal">{meta.goal}</div>
      
      {d.ws?.git?.message && (
        <div className="desk-task">
          <span className="task-label">Last:</span> {d.ws.git.message.substring(0, 50)}
        </div>
      )}
      
      <div className="desk-footer">
        <span className="desk-time">{d.lastActive ? timeAgo(d.lastActive) : 'dormant'}</span>
        {d.hasSessions && <span className="desk-sessions">📡 {d.sess.sessions.length}</span>}
      </div>
    </div>
  )
}

function DetailPanel({ name, snap, onClose }) {
  if (!name) return null
  const meta = AGENT_META[name] || { label: name, emoji: '🤖', desc: '', group: '?', goal: '' }
  const d = getAgentStatus(snap, name)
  const ws = d.ws || {}
  const crons = (snap?.cronJobs || []).filter(c => c.agentId === name)

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose}>✕</button>
        
        <div className="panel-header">
          <span className="panel-emoji">{meta.emoji}</span>
          <div>
            <h2>{meta.label}</h2>
            <div className="panel-desc">{meta.desc} · {meta.group}</div>
          </div>
          <span className={`desk-status-dot s-${d.status}`} style={{ width: 14, height: 14 }}></span>
        </div>
        
        <div className="panel-goal">{meta.goal}</div>
        
        {/* Status row */}
        <div className="panel-row">
          <div className="panel-card">
            <div className="pc-label">Status</div>
            <div className={`pc-val s-text-${d.status}`}>{d.status.toUpperCase()}</div>
          </div>
          <div className="panel-card">
            <div className="pc-label">Context</div>
            <div className="pc-val">{d.sess?.avgContextPct != null ? `${d.sess.avgContextPct}%` : '—'}</div>
          </div>
          <div className="panel-card">
            <div className="pc-label">Sessions</div>
            <div className="pc-val">{d.sess?.sessions?.length || 0}</div>
          </div>
          <div className="panel-card">
            <div className="pc-label">Model</div>
            <div className="pc-val" style={{ fontSize: 11 }}>{d.sess?.model?.split('/').pop() || '—'}</div>
          </div>
          <div className="panel-card">
            <div className="pc-label">Last Active</div>
            <div className="pc-val" style={{ fontSize: 11 }}>{d.lastActive ? timeAgo(d.lastActive) : '—'}</div>
          </div>
        </div>
        
        {/* Git */}
        {ws.git && (
          <div className="panel-section">
            <div className="ps-title">📦 Git</div>
            <div className="ps-row"><span>Branch</span><code>{ws.git.branch || '—'}</code></div>
            <div className="ps-row"><span>Last Commit</span><code>{ws.git.hash}</code> {ws.git.message}</div>
            <div className="ps-row"><span>Committed</span>{ws.git.lastCommitAt ? timeAgo(ws.git.lastCommitAt) : '—'}</div>
          </div>
        )}
        
        {/* Crons */}
        {crons.length > 0 && (
          <div className="panel-section">
            <div className="ps-title">⏰ Crons ({crons.length})</div>
            {crons.map((c, i) => (
              <div className="ps-row" key={i}>
                <span className={`mini-dot ${c.lastStatus === 'ok' ? 'dot-ok' : c.lastStatus === 'error' ? 'dot-err' : 'dot-warn'}`}></span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ color: '#555', fontSize: 9 }}>{c.lastRunAt ? timeAgo(c.lastRunAt) : '—'}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Decisions */}
        {ws.decisions?.length > 0 && (
          <div className="panel-section">
            <div className="ps-title">📝 Recent Decisions</div>
            {ws.decisions.map((d, i) => (
              <div className="ps-entry" key={i}>
                <span className="ps-date">{d.date}</span>
                <span className="ps-text">{d.decision}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Failures */}
        {ws.failures?.length > 0 && (
          <div className="panel-section">
            <div className="ps-title">⚠️ Recent Failures</div>
            {ws.failures.map((f, i) => (
              <div className="ps-entry" key={i}>
                <span className="ps-date">{f.date || '?'}</span>
                <span className="ps-text">{f.title}</span>
                {f.lesson && <div className="ps-lesson">💡 {f.lesson}</div>}
              </div>
            ))}
          </div>
        )}
        
        {/* Memory summary */}
        {ws.memorySummary && (
          <div className="panel-section">
            <div className="ps-title">🧠 Memory</div>
            <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4 }}>{ws.memorySummary}</div>
          </div>
        )}
        
        {/* Latest daily note */}
        {ws.lastDailyNote && (
          <div className="panel-section">
            <div className="ps-title">📅 Latest Note ({ws.lastDailyNote})</div>
            <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4 }}>{ws.lastDailyNoteSummary}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FleetPage() {
  const snap = useSnapshot()
  const [selected, setSelected] = useState(null)
  
  const fh = snap?.fleetHealth
  const sess = snap?.sessions
  
  const groups = {
    'Core': ['main', 'command-centre', 'audit'],
    'CAIRR Clients': ['bts', 'gridpilot'],
    'NBHW': ['nbhw', 'overdue-office'],
    'Investments': ['v3dn', 'property', 'alpha'],
  }
  
  // Stats
  const allAgents = Object.values(groups).flat()
  const activeCount = allAgents.filter(n => getAgentStatus(snap, n).status === 'active').length
  const recentCount = allAgents.filter(n => getAgentStatus(snap, n).status === 'recent').length
  const errorCount = allAgents.filter(n => getAgentStatus(snap, n).status === 'error').length

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fleet — Office Floor</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080a;color:#e0e0e0;padding:16px 20px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          
          .nav{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px}
          .nav a:hover{border-color:#3b82f6}
          .nav a.active{border-color:#a855f7;color:#a855f7}
          
          .floor-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px}
          .floor-header h1{font-size:22px;color:#fff;letter-spacing:-0.5px}
          .floor-stats{display:flex;gap:8px}
          .stat{padding:6px 14px;border-radius:8px;text-align:center;border:1px solid #222;background:#0a0a0a}
          .stat-val{font-size:20px;font-weight:800}
          .stat-lbl{font-size:8px;color:#555;text-transform:uppercase;letter-spacing:1px}
          
          .floor-section{margin-bottom:24px}
          .section-label{font-size:9px;color:#444;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:10px;padding-left:4px}
          
          .desk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
          @media(max-width:600px){.desk-grid{grid-template-columns:1fr}}
          
          /* ── Agent Desk ── */
          .desk{position:relative;background:#0d0d10;border:1px solid #1a1a22;border-radius:12px;padding:14px;cursor:pointer;transition:all .25s;overflow:hidden}
          .desk:hover{border-color:#3b82f6;transform:translateY(-2px);box-shadow:0 4px 20px rgba(59,130,246,0.08)}
          
          .desk-active{border-color:#10b981;box-shadow:0 0 20px rgba(16,185,129,0.06)}
          .desk-error{border-color:#ef4444;box-shadow:0 0 20px rgba(239,68,68,0.08)}
          .desk-idle{opacity:0.5}
          .desk-idle:hover{opacity:0.8}
          
          /* Pulse animation for active agents */
          .desk-active .desk-pulse-ring{position:absolute;top:10px;right:10px;width:10px;height:10px;border-radius:50%;background:rgba(16,185,129,0.3);animation:pulse 2s ease-in-out infinite}
          @keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(2.2);opacity:0}}
          
          .desk-header{display:flex;align-items:center;gap:6px;margin-bottom:4px}
          .desk-emoji{font-size:18px}
          .desk-name{font-size:14px;font-weight:700;color:#fff;flex:1}
          
          .desk-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
          .s-active{background:#10b981;box-shadow:0 0 6px #10b981}
          .s-recent{background:#3b82f6}
          .s-error{background:#ef4444;animation:blink 1s infinite}
          .s-idle{background:#333}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
          
          .desk-desc{font-size:9px;color:#555;margin-bottom:6px}
          .desk-model{font-size:8px;color:#a855f7;background:#1a0a2a;padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:6px;font-weight:600}
          
          .ctx-bar-wrap{position:relative;height:6px;background:#1a1a1a;border-radius:3px;margin-bottom:6px;overflow:hidden}
          .ctx-bar{height:100%;border-radius:3px;transition:width .5s}
          .ctx-label{position:absolute;right:4px;top:-1px;font-size:7px;color:#666;font-weight:600}
          
          .desk-goal{font-size:9px;color:#666;line-height:1.3;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
          
          .desk-task{font-size:8px;color:#888;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
          .task-label{color:#555;font-weight:600}
          
          .desk-footer{display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#444;margin-top:4px;padding-top:4px;border-top:1px solid #151518}
          .desk-sessions{color:#3b82f6}
          
          /* ── Detail Panel ── */
          .panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:100;display:flex;justify-content:flex-end;animation:fadeIn .2s}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          .panel{width:min(480px,90vw);height:100vh;background:#0c0c0f;border-left:1px solid #222;overflow-y:auto;padding:20px;animation:slideIn .25s;position:relative}
          @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
          .panel-close{position:absolute;top:12px;right:12px;background:#1a1a1a;border:1px solid #333;color:#888;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center}
          .panel-close:hover{color:#fff;border-color:#555}
          
          .panel-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
          .panel-emoji{font-size:32px}
          .panel-header h2{font-size:18px;color:#fff;margin:0}
          .panel-desc{font-size:10px;color:#555}
          .panel-goal{font-size:11px;color:#888;margin-bottom:16px;padding:8px 10px;background:#111;border-radius:8px;border-left:3px solid #3b82f6}
          
          .panel-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
          .panel-card{flex:1;min-width:70px;background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:8px;text-align:center}
          .pc-label{font-size:7px;color:#555;text-transform:uppercase;letter-spacing:0.8px}
          .pc-val{font-size:14px;font-weight:700;color:#fff;margin-top:2px}
          .s-text-active{color:#10b981}
          .s-text-recent{color:#3b82f6}
          .s-text-error{color:#ef4444}
          .s-text-idle{color:#555}
          
          .panel-section{margin-bottom:14px;padding:10px;background:#0a0a0d;border:1px solid #1a1a1a;border-radius:8px}
          .ps-title{font-size:10px;color:#888;font-weight:700;margin-bottom:6px}
          .ps-row{display:flex;align-items:center;gap:6px;font-size:10px;color:#aaa;padding:3px 0;border-bottom:1px solid #111}
          .ps-row:last-child{border-bottom:none}
          .ps-row span:first-child{color:#555;min-width:80px;font-weight:600}
          .ps-row code{font-family:monospace;color:#a855f7;font-size:9px;background:#1a0a2a;padding:1px 4px;border-radius:3px}
          
          .mini-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
          .dot-ok{background:#10b981}
          .dot-err{background:#ef4444}
          .dot-warn{background:#f59e0b}
          
          .ps-entry{padding:4px 0;border-bottom:1px solid #111;font-size:10px}
          .ps-entry:last-child{border-bottom:none}
          .ps-date{color:#555;font-weight:600;margin-right:6px;font-size:9px}
          .ps-text{color:#aaa}
          .ps-lesson{font-size:9px;color:#f59e0b;margin-top:2px;padding-left:8px}
          
          .pipeline{display:flex;align-items:center;gap:2px;margin:8px 0}
          .pip-dot{display:flex;flex-direction:column;align-items:center;gap:2px}
          .pip-inner{width:8px;height:8px;border-radius:50%;background:#222;border:1px solid #333;transition:all .3s}
          .pip-active .pip-inner{background:#10b981;border-color:#10b981}
          .pip-current .pip-inner{box-shadow:0 0 8px #10b981}
          .pip-label{font-size:6px;color:#444}
          .pip-dot+.pip-dot::before{content:'';display:none}
          
          .footer{font-size:8px;color:#1a1a1a;text-align:right;margin-top:24px}
        `}</style>
      </Head>

      <div>
        <div className="nav">
          <a href="/">🎯 Dashboard</a>
          <a href="/fleet" className="active">🏢 Fleet</a>
          <a href="/system">🔌 System</a>
          <a href="/nbhw-seo">🔧 NBHW SEO</a>
          <a href="/ricky">🧠 Ricky</a>
        </div>

        <div className="floor-header">
          <h1>🏢 Office Floor</h1>
          <div className="floor-stats">
            <div className="stat">
              <div className="stat-val" style={{ color: '#10b981' }}>{activeCount}</div>
              <div className="stat-lbl">Working</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: '#3b82f6' }}>{recentCount}</div>
              <div className="stat-lbl">Recent</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: errorCount > 0 ? '#ef4444' : '#333' }}>{errorCount}</div>
              <div className="stat-lbl">Errors</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: '#a855f7' }}>{allAgents.length}</div>
              <div className="stat-lbl">Total</div>
            </div>
          </div>
        </div>

        {Object.entries(groups).map(([groupName, agents]) => (
          <div className="floor-section" key={groupName}>
            <div className="section-label">{groupName}</div>
            <div className="desk-grid">
              {agents.map(name => (
                <AgentDesk key={name} name={name} snap={snap} onClick={setSelected} />
              ))}
            </div>
          </div>
        ))}

        <DetailPanel name={selected} snap={snap} onClose={() => setSelected(null)} />

        <div className="footer">Office Floor · Auto-refresh 30s · {snap?.timestamp ? timeAgo(snap.timestamp) : 'no data'}</div>
      </div>
    </>
  )
}
