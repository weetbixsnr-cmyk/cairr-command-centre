import Head from 'next/head'
import { useState, useEffect } from 'react'

function useApi(url, interval = 30000) {
  const [data, setData] = useState(null)
  useEffect(() => {
    const load = () => fetch(url).then(r => r.json()).then(setData).catch(() => {})
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [url, interval])
  return data
}

// Agent domain/group mapping
const AGENT_GROUPS = {
  'Core': ['main', 'command-centre', 'audit'],
  'CAIRR': ['bts', 'gridpilot'],
  'NBHW': ['nbhw', 'nbhw-accounts', 'overdue-office'],
  'Investments': ['property', 'v3dn', 'alpha'],
  'Governance': ['opt-compliance', 'opt-quality', 'opt-security'],
}

const AGENT_DESCRIPTIONS = {
  'main': 'Brain (Ricky-Jnr) — orchestrator',
  'command-centre': 'Overwatch — this dashboard',
  'audit': 'Audit agent — quality gates',
  'bts': 'Better Training Solutions — SEO/content',
  'gridpilot': 'GridPilot — energy platform R&D',
  'nbhw': 'Northern Beaches Hot Water — website/SEO',
  'nbhw-accounts': 'NBHW accounts/invoicing',
  'overdue-office': 'NBHW overdue job tracking',
  'property': 'Property scanner — commercial/industrial',
  'v3dn': 'V3DN — crypto trading analysis',
  'alpha': 'Alpha — property dashboard',
  'opt-compliance': 'Compliance checks',
  'opt-quality': 'Quality checks',
  'opt-security': 'Security checks',
}

function ContextBar({ pct }) {
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, marginTop: 4 }}>
      <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 2 }}></div>
    </div>
  )
}

export default function FleetPage() {
  const fleet = useApi('/api/fleet-health')
  const sessions = useApi('/api/sessions')
  const gov = useApi('/api/governance')
  const system = useApi('/api/system')

  // Build enriched agent map
  const agentMap = {}
  if (fleet?.agents) {
    for (const a of fleet.agents) {
      agentMap[a.name] = { ...agentMap[a.name], healthy: a.healthy, notes: a.notes }
    }
  }
  if (sessions?.byAgent) {
    for (const [name, data] of Object.entries(sessions.byAgent)) {
      agentMap[name] = { ...agentMap[name], ...data }
    }
  }
  if (sessions?.heartbeats) {
    for (const [name, status] of Object.entries(sessions.heartbeats)) {
      agentMap[name] = { ...agentMap[name], heartbeat: status }
    }
  }
  if (gov?.agents) {
    for (const a of gov.agents) {
      agentMap[a.name] = { ...agentMap[a.name], govStatus: a.status, govDetail: a.detail }
    }
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fleet View — Command Centre</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 16px; }
          a { color: #3b82f6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .back { font-size: 12px; margin-bottom: 16px; display: inline-block; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .header h1 { font-size: 20px; color: #fff; }
          .summary { display: flex; gap: 16px; font-size: 11px; }
          .summary-item { padding: 6px 12px; background: #111; border: 1px solid #222; border-radius: 8px; }
          .summary-val { font-size: 18px; font-weight: 700; }
          .summary-lbl { font-size: 9px; color: #555; margin-top: 2px; }
          
          .group { margin-bottom: 20px; }
          .group-title { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #1a1a1a; }
          .agent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
          @media (max-width: 600px) { .agent-grid { grid-template-columns: 1fr; } }
          
          .agent-card { background: #111; border: 1px solid #222; border-radius: 10px; padding: 12px 14px; cursor: pointer; transition: border-color 0.2s; }
          .agent-card:hover { border-color: #3b82f6; }
          .agent-card.unhealthy { border-color: #ef4444; }
          .agent-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
          .agent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
          .agent-dot.ok { background: #10b981; }
          .agent-dot.fail { background: #ef4444; }
          .agent-dot.unknown { background: #333; }
          .agent-name { font-size: 13px; font-weight: 600; color: #fff; flex: 1; }
          .agent-tag { font-size: 7px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
          .agent-tag.hb-disabled { background: #1a1a1a; color: #555; }
          .agent-tag.hb-ok { background: #0a2a1a; color: #10b981; }
          .agent-tag.hb-error { background: #3b1010; color: #ef4444; }
          .agent-desc { font-size: 9px; color: #555; margin-bottom: 6px; }
          .agent-meta { display: flex; gap: 12px; font-size: 9px; color: #666; }
          .agent-meta span { display: flex; align-items: center; gap: 3px; }
          
          .connections { margin-top: 24px; background: #111; border: 1px solid #222; border-radius: 10px; padding: 16px; }
          .conn-title { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-weight: 600; }
          .conn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
          .conn-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #0a0a0a; border-radius: 6px; border: 1px solid #1a1a1a; font-size: 10px; }
          .conn-arrow { color: #333; }
        `}</style>
      </Head>

      <div>
        <a href="/" className="back">← Back to Dashboard</a>
        <div className="header">
          <h1>🏢 Fleet — Office Floor</h1>
          <div className="summary">
            <div className="summary-item">
              <div className="summary-val" style={{ color: '#10b981' }}>{sessions?.totalAgents || '—'}</div>
              <div className="summary-lbl">Agents</div>
            </div>
            <div className="summary-item">
              <div className="summary-val" style={{ color: '#3b82f6' }}>{sessions?.totalSessions || '—'}</div>
              <div className="summary-lbl">Sessions</div>
            </div>
            <div className="summary-item">
              <div className="summary-val" style={{ color: fleet?.pct >= 90 ? '#10b981' : '#f59e0b' }}>{fleet?.pct || '—'}%</div>
              <div className="summary-lbl">Health</div>
            </div>
          </div>
        </div>

        {Object.entries(AGENT_GROUPS).map(([groupName, agentNames]) => {
          const groupAgents = agentNames.map(n => ({ name: n, ...(agentMap[n] || {}) }))
          return (
            <div className="group" key={groupName}>
              <div className="group-title">{groupName}</div>
              <div className="agent-grid">
                {groupAgents.map(agent => (
                  <a href={`/agent/${agent.name}`} key={agent.name} style={{ textDecoration: 'none' }}>
                    <div className={`agent-card ${agent.healthy === false ? 'unhealthy' : ''}`}>
                      <div className="agent-top">
                        <span className={`agent-dot ${agent.healthy === true ? 'ok' : agent.healthy === false ? 'fail' : 'unknown'}`}></span>
                        <span className="agent-name">{agent.name}</span>
                        {agent.heartbeat && (
                          <span className={`agent-tag hb-${agent.heartbeat === 'disabled' ? 'disabled' : agent.heartbeat === 'ok' ? 'ok' : 'error'}`}>
                            HB: {agent.heartbeat}
                          </span>
                        )}
                      </div>
                      <div className="agent-desc">{AGENT_DESCRIPTIONS[agent.name] || ''}</div>
                      {agent.avgContextPct != null && <ContextBar pct={agent.avgContextPct} />}
                      <div className="agent-meta">
                        {agent.model && <span>🤖 {agent.model}</span>}
                        {agent.sessions?.length > 0 && <span>📡 {agent.sessions.length} session{agent.sessions.length !== 1 ? 's' : ''}</span>}
                        {agent.avgContextPct != null && <span>📊 {agent.avgContextPct}% ctx</span>}
                        {agent.govStatus && <span>{agent.govStatus === 'ok' ? '🔒' : '⚠️'} gov</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        })}

        {/* How they connect */}
        <div className="connections">
          <div className="conn-title">How They Connect</div>
          <div className="conn-grid">
            <div className="conn-item">
              <span>🧠 Brain</span>
              <span className="conn-arrow">→</span>
              <span>orchestrates all agents</span>
            </div>
            <div className="conn-item">
              <span>🎯 Overwatch</span>
              <span className="conn-arrow">→</span>
              <span>reads pipeline results</span>
            </div>
            <div className="conn-item">
              <span>🔍 Audit</span>
              <span className="conn-arrow">→</span>
              <span>gates all deliverables</span>
            </div>
            <div className="conn-item">
              <span>📊 Pipeline</span>
              <span className="conn-arrow">→</span>
              <span>fleet-health, governance</span>
            </div>
            <div className="conn-item">
              <span>💬 Discord</span>
              <span className="conn-arrow">→</span>
              <span>agent channels + Adam</span>
            </div>
            <div className="conn-item">
              <span>📱 WhatsApp</span>
              <span className="conn-arrow">→</span>
              <span>client comms</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
