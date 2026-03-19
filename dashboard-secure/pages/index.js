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

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function Light({ s }) {
  const c = s === 'ok' || s === true ? '#10b981' : s === 'warn' ? '#f59e0b' : s === 'fail' || s === false ? '#ef4444' : '#333'
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }}></span>
}

function CtxBar({ pct }) {
  if (pct == null) return null
  const c = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: 4, width: `${pct}%`, background: c, borderRadius: 2 }}></div>
    </div>
  )
}

const AGENT_META = {
  'main': { emoji: '🧠', label: 'Brain', goal: 'Orchestrate all agents' },
  'command-centre': { emoji: '🎯', label: 'Command Centre', goal: 'Dashboard & monitoring' },
  'audit': { emoji: '🔍', label: 'Audit', goal: 'Quality gates' },
  'nbhw': { emoji: '🔧', label: 'NBHW', goal: 'Rank #1 NB suburb keywords' },
  'bts': { emoji: '🎓', label: 'BTS', goal: 'SEO for Better Training (£300/mo)' },
  'v3dn': { emoji: '📊', label: 'V3DN', goal: 'Crypto trading scripts' },
  'gridpilot': { emoji: '⚡', label: 'GridPilot', goal: 'Energy platform R&D' },
  'alpha': { emoji: '🏠', label: 'Alpha', goal: 'Property dashboard' },
  'property': { emoji: '🏘️', label: 'Property', goal: 'Property deals scanner' },
  'overdue-office': { emoji: '📋', label: 'Overdue Office', goal: 'Overdue job tracking' },
}

export default function Dashboard() {
  const snap = useSnapshot()
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

  const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const staleMinutes = snap?.timestamp ? Math.floor((Date.now() - new Date(snap.timestamp).getTime()) / 60000) : null
  const isStale = staleMinutes !== null && staleMinutes > 10

  const fh = snap?.fleetHealth
  const healthPct = fh?.pct ?? '—'
  const healthColor = healthPct >= 90 ? '#10b981' : healthPct >= 70 ? '#f59e0b' : '#ef4444'

  const aq = snap?.actionQueue
  const pendingItems = aq?.items?.filter(i => i.status === 'pending') || []
  const overdueItems = pendingItems.filter(i => i.overdue)

  const sess = snap?.sessions
  const gw = snap?.gateway
  const ws = snap?.agentWorkspaces || {}

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
          .nav{display:flex;gap:8px;margin-bottom:14px}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px}
          .nav a:hover{border-color:#3b82f6}

          /* ── Status Strip (Row 1) ── */
          .strip{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
          .strip-item{background:#0d0d10;border:1px solid #1a1a22;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;flex:1;min-width:120px}
          .strip-val{font-size:18px;font-weight:800}
          .strip-lbl{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:0.8px}

          /* ── Agent Scorecards (main content) ── */
          .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:14px}
          @media(max-width:600px){.cards{grid-template-columns:1fr}}

          .acard{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px;transition:all .2s;cursor:pointer}
          .acard:hover{border-color:#3b82f6;transform:translateY(-1px)}
          .acard.active{border-color:#10b981}
          .acard.idle{opacity:0.55}.acard.idle:hover{opacity:0.8}
          .acard.error{border-color:#ef4444}

          .acard-top{display:flex;align-items:center;gap:6px;margin-bottom:6px}
          .acard-emoji{font-size:18px}
          .acard-name{font-size:13px;font-weight:700;color:#fff;flex:1}
          .acard-status{width:8px;height:8px;border-radius:50%}
          .s-active{background:#10b981;box-shadow:0 0 6px #10b981}
          .s-recent{background:#3b82f6}
          .s-error{background:#ef4444;animation:blink 1s infinite}
          .s-idle{background:#333}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

          .acard-goal{font-size:9px;color:#999;margin-bottom:8px}

          .acard-build{background:#0a0a0d;border:1px solid #151518;border-radius:6px;padding:8px;margin-bottom:8px}
          .build-label{font-size:7px;color:#888;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;font-weight:700}
          .build-text{font-size:10px;color:#ccc;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
          .build-sub{font-size:9px;color:#999;margin-top:2px}

          .acard-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px}
          .acard-stat{text-align:center;background:#0a0a0d;border-radius:4px;padding:4px 2px}
          .acard-stat-val{font-size:14px;font-weight:800}
          .acard-stat-lbl{font-size:6px;color:#999;text-transform:uppercase;letter-spacing:0.5px}

          .acard-ctx{margin-bottom:6px}
          .acard-model{font-size:8px;color:#a855f7;background:#1a0a2a;padding:2px 6px;border-radius:4px;display:inline-block;font-weight:600}
          .acard-footer{display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#888;padding-top:4px;border-top:1px solid #151518}

          /* ── Action Queue ── */
          .aq{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px;margin-bottom:14px}
          .sec-t{font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:3px}
          .aq-row{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #111;align-items:center;font-size:10px}
          .aq-row:last-child{border-bottom:none}
          .aq-src{font-size:8px;color:#3b82f6;font-weight:600;min-width:50px;text-transform:uppercase}
          .aq-text{color:#aaa;flex:1}
          .aq-overdue{color:#ef4444 !important;font-weight:600}
          .badge{font-size:7px;padding:1px 5px;border-radius:4px;font-weight:600}
          .badge.overdue{background:#3b1010;color:#ef4444}
          .badge.high{background:#2a2000;color:#f59e0b}
          .aq-btns{display:flex;gap:3px;flex-shrink:0}
          .aq-btn{font-size:8px;padding:2px 6px;border-radius:4px;border:1px solid #333;background:#1a1a1a;color:#888;cursor:pointer;font-weight:600;transition:all .15s}
          .aq-btn:hover{border-color:#999;color:#fff}
          .aq-btn.approve{color:#10b981;border-color:#10b981}.aq-btn.approve:hover{background:#0a2a1a}
          .aq-btn.reject{color:#ef4444;border-color:#ef4444}.aq-btn.reject:hover{background:#3b1010}
          .aq-btn.complete{color:#3b82f6;border-color:#3b82f6}.aq-btn.complete:hover{background:#0e1a2e}
          .aq-btn.snooze{color:#f59e0b;border-color:#f59e0b}.aq-btn.snooze:hover{background:#2a2000}

          .footer{font-size:8px;color:#1a1a1a;text-align:right;margin-top:16px}
        `}</style>
      </Head>

      <div>
        <div className="top">
          <div>
            <span className="live-dot" style={{ background: isStale ? '#ef4444' : '#10b981' }}></span>
            <h1>🎯 Adam's Command Centre</h1>
          </div>
          <span className={`meta ${isStale ? 'stale' : ''}`}>
            {now} · {isStale ? `⚠️ STALE (${staleMinutes}m)` : 'Live'} · Synced {snap?.timestamp ? timeAgo(snap.timestamp) : '—'}
          </span>
        </div>

        <div className="nav">
          <a href="/fleet">🏢 Fleet</a>
          <a href="/system">🔌 System</a>
          <a href="/ricky">🧠 Ricky</a>
        </div>

        {/* ── Status Strip ── */}
        <div className="strip">
          <div className="strip-item">
            <div>
              <div className="strip-val" style={{ color: typeof healthPct === 'number' ? healthColor : '#555' }}>{healthPct}{typeof healthPct === 'number' ? '%' : ''}</div>
              <div className="strip-lbl">Fleet Health</div>
            </div>
          </div>
          <div className="strip-item">
            <div>
              <div className="strip-val" style={{ color: '#3b82f6' }}>{sess?.totalSessions || '—'}</div>
              <div className="strip-lbl">Sessions</div>
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
              <div className="strip-val" style={{ color: gw?.status === 'running' ? '#10b981' : '#ef4444' }}>●</div>
              <div className="strip-lbl">Gateway {gw?.status || '?'}</div>
            </div>
          </div>
        </div>

        {/* ── Agent Scorecards ── */}
        <div className="cards">
          {(fh?.agents || []).map(agent => {
            const meta = AGENT_META[agent.name] || { emoji: '🤖', label: agent.name, goal: '' }
            const agentSess = sess?.byAgent?.[agent.name]
            const agentWs = ws[agent.name] || {}
            const rpt = snap?.agentReports?.[agent.name]
            
            const hasSessions = agentSess?.sessions?.length > 0
            // Most recent of: git commit, session activity, agent activity, report
            const actCandidates = [
              agentWs.git?.lastCommitAt,
              agentSess?.lastSessionActivity ? new Date(agentSess.lastSessionActivity).toISOString() : null,
              agentSess?.lastAgentActivity ? new Date(agentSess.lastAgentActivity).toISOString() : null,
              rpt?.lastUpdated
            ].filter(Boolean)
            const lastActive = actCandidates.length > 0 ? actCandidates.reduce((a, b) => new Date(a) > new Date(b) ? a : b) : null
            const hAgo = lastActive ? (Date.now() - new Date(lastActive).getTime()) / 3600000 : Infinity
            const status = !agent.healthy ? 'error' : (hasSessions && hAgo < 1) ? 'active' : hAgo < 24 ? 'recent' : 'idle'
            const statusClass = status === 'active' ? 'active' : status === 'error' ? 'error' : status === 'idle' ? 'idle' : ''

            return (
              <a href={`/agent/${agent.name}`} key={agent.name} style={{ textDecoration: 'none' }}>
                <div className={`acard ${statusClass}`}>
                  <div className="acard-top">
                    <span className="acard-emoji">{meta.emoji}</span>
                    <span className="acard-name">{meta.label}</span>
                    <div className={`acard-status s-${status}`}></div>
                  </div>
                  <div className="acard-goal">{meta.goal}</div>

                  {/* Build status */}
                  <div className="acard-build">
                    {agentWs.currentTasks?.[0] && (
                      <>
                        <div className="build-label">🔨 Building Now</div>
                        <div className="build-text">{agentWs.currentTasks[0]}</div>
                      </>
                    )}
                    {agentWs.git?.message && (
                      <>
                        <div className="build-label" style={{ marginTop: agentWs.currentTasks?.[0] ? 6 : 0 }}>Last Commit</div>
                        <div className="build-text">{agentWs.git.message}</div>
                        <div className="build-sub">{agentWs.git.branch} · {agentWs.git.hash} · {agentWs.git.lastCommitAt ? timeAgo(agentWs.git.lastCommitAt) : '—'}</div>
                      </>
                    )}
                    {!agentWs.currentTasks?.[0] && !agentWs.git?.message && (
                      <div className="build-text" style={{ color: '#333' }}>No activity</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="acard-stats">
                    <div className="acard-stat">
                      <div className="acard-stat-val" style={{ color: (agentSess?.sessions?.length || 0) > 0 ? '#3b82f6' : '#333' }}>{agentSess?.sessions?.length || 0}</div>
                      <div className="acard-stat-lbl">Sessions</div>
                    </div>
                    <div className="acard-stat">
                      <div className="acard-stat-val" style={{ color: (agentWs.weeklyCommits || 0) >= 2 ? '#10b981' : (agentWs.weeklyCommits || 0) >= 1 ? '#f59e0b' : '#ef4444' }}>{agentWs.weeklyCommits || 0}</div>
                      <div className="acard-stat-lbl">Commits/wk</div>
                    </div>
                    <div className="acard-stat">
                      <div className="acard-stat-val" style={{ color: (agentWs.weeklyFailures || 0) === 0 ? '#10b981' : '#ef4444' }}>{agentWs.weeklyFailures || 0}</div>
                      <div className="acard-stat-lbl">Fails/wk</div>
                    </div>
                    <div className="acard-stat">
                      <div className="acard-stat-val" style={{ color: (agentWs.decisions?.length || 0) > 0 ? '#a855f7' : '#333' }}>{agentWs.decisions?.length || 0}</div>
                      <div className="acard-stat-lbl">Decisions</div>
                    </div>
                  </div>

                  {/* Context bar */}
                  {agentSess?.avgContextPct != null && (
                    <div className="acard-ctx">
                      <CtxBar pct={agentSess.avgContextPct} />
                    </div>
                  )}

                  <div className="acard-footer">
                    {(agentSess?.configModel || agentSess?.model) && <span className="acard-model">{(agentSess.configModel || agentSess.model).split('/').pop().replace('claude-', '')}</span>}
                    <span>{lastActive ? timeAgo(lastActive) : 'dormant'}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* ── Active Sessions ── */}
        {(() => {
          const allSessions = sess?.byAgent?._allSessions || []
          if (allSessions.length === 0) return null
          const AGENT_EMOJIS = { main: '🧠', 'command-centre': '🎯', nbhw: '🔧', bts: '🎓', audit: '🔍', v3dn: '📈', property: '🏠', alpha: '🏗️', gridpilot: '⚡', 'overdue-office': '📋' }
          const LOC_ICONS = { discord: '💬', cron: '⏰', terminal: '🖥️', signal: '📱', whatsapp: '💬' }
          const LOC_LABELS = { discord: 'Discord', cron: 'Cron', terminal: 'Terminal', signal: 'Signal', whatsapp: 'WhatsApp' }
          return (
            <div style={{ marginBottom: 20 }}>
              <div className="sec-t">📡 Active Sessions — {allSessions.length} total</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {allSessions.sort((a, b) => (b.percentUsed || 0) - (a.percentUsed || 0)).map((s, i) => {
                  const pct = s.percentUsed || 0
                  const barColor = pct >= 80 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#10b981'
                  const ageH = s.age ? s.age / 3600000 : 0
                  const ageLabel = ageH < 1 ? '<1h' : ageH < 24 ? `${Math.floor(ageH)}h` : `${Math.floor(ageH / 24)}d`
                  const emoji = AGENT_EMOJIS[s.agent] || '🤖'
                  const locIcon = LOC_ICONS[s.location] || '📡'
                  const locLabel = LOC_LABELS[s.location] || s.location
                  return (
                    <div key={i} style={{ background: '#111', border: `1px solid ${pct >= 65 ? '#ef4444' : '#222'}`, borderRadius: 10, padding: 10, borderLeft: `3px solid ${barColor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 14 }}>{emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', flex: 1 }}>{s.agent}</span>
                        <span style={{ fontSize: 10, color: '#999' }}>{locIcon} {locLabel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: barColor }}>{pct}%</span>
                        <div style={{ flex: 1, height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: 5, width: `${pct}%`, background: barColor, borderRadius: 3 }}></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#999' }}>
                        <span>{(s.totalTokens / 1000).toFixed(0)}k tokens</span>
                        <span>{(s.remainingTokens / 1000).toFixed(0)}k remaining</span>
                        <span>{s.model?.replace('claude-', '').replace('-20250514', '') || '?'}</span>
                        <span>{ageLabel}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* ── Action Queue ── */}
        <div className="aq">
          <div className="sec-t">
            Action Queue — {pendingItems.length} pending
            {overdueItems.length > 0 && <span style={{ color: '#ef4444', marginLeft: 8 }}>🔴 {overdueItems.length} overdue</span>}
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
                  {item.type === 'approval' && (
                    <>
                      <button className="aq-btn approve" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'approve') }}>✓</button>
                      <button className="aq-btn reject" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'reject') }}>✗</button>
                    </>
                  )}
                  <button className="aq-btn complete" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'complete') }}>Done</button>
                  {item.overdue && <button className="aq-btn snooze" onClick={(e) => { e.preventDefault(); handleAction(item.id, 'snooze') }}>+24h</button>}
                </div>
              </div>
            ))}
        </div>



        <div className="footer">🎯 Command Centre · Auto-refresh 30s · {snap?.timestamp ? timeAgo(snap.timestamp) : 'No data'}</div>
      </div>
    </>
  )
}
