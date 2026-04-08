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
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function Light({ ok }) {
  const c = ok === true ? '#10b981' : ok === false ? '#ef4444' : ok === 'warn' ? '#f59e0b' : '#333'
  return <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }}></span>
}

// Architecture layers
const LAYERS = [
  {
    name: 'BRAIN',
    desc: 'Orchestration Layer',
    color: '#a855f7',
    nodes: [
      { id: 'main', label: 'Brain (Ricky-Jnr)', desc: 'Orchestrator — routes tasks, enforces governance, cross-references agents', icon: '🧠' },
    ]
  },
  {
    name: 'OPERATIONS',
    desc: 'Monitoring & Quality',
    color: '#3b82f6',
    nodes: [
      { id: 'command-centre', label: 'Overwatch', desc: 'This dashboard — aggregates fleet data', icon: '🎯' },
      { id: 'audit', label: 'Audit', desc: 'Quality gates — reviews all deliverables', icon: '🔍' },
      { id: 'opt-compliance', label: 'Compliance', desc: 'Compliance checks', icon: '📋' },
      { id: 'opt-quality', label: 'Quality', desc: 'Quality checks', icon: '✅' },
      { id: 'opt-security', label: 'Security', desc: 'Security checks', icon: '🔒' },
    ]
  },
  {
    name: 'CAIRR (AI CONSULTANCY)',
    desc: 'Revenue — Clients & Products',
    color: '#10b981',
    nodes: [
      { id: 'bts', label: 'BTS', desc: 'Better Training Solutions — SEO/content (£300/mo)', icon: '📈' },
      { id: 'gridpilot', label: 'GridPilot', desc: 'Energy platform R&D', icon: '⚡' },
    ]
  },
  {
    name: 'NBHW (PLUMBING)',
    desc: 'Northern Beaches Hot Water',
    color: '#f59e0b',
    nodes: [
      { id: 'nbhw', label: 'NBHW', desc: 'Website & SEO', icon: '🔧' },
      { id: 'nbhw-accounts', label: 'NBHW Accounts', desc: 'Invoicing & accounting', icon: '💰' },
      { id: 'overdue-office', label: 'Overdue Office', desc: 'Overdue job tracking', icon: '⏰' },
    ]
  },
  {
    name: 'INVESTMENTS',
    desc: 'Property & Crypto',
    color: '#ec4899',
    nodes: [
      { id: 'property', label: 'Property', desc: 'Commercial/industrial scanner', icon: '🏠' },
      { id: 'v3dn', label: 'V3DN', desc: 'Crypto trading analysis', icon: '📊' },
      { id: 'alpha', label: 'Alpha', desc: 'Property dashboard', icon: '🏢' },
    ]
  },
]

const DATA_FLOWS = [
  { from: 'Pipeline scripts', to: 'dev/pipeline-results/', desc: 'Fleet health, governance, agent reports', color: '#3b82f6' },
  { from: 'push-snapshot.js', to: 'Vercel KV', desc: 'Bundled JSON every 5 min', color: '#10b981' },
  { from: 'Vercel KV', to: 'Dashboard', desc: 'API reads on load + 30s refresh', color: '#a855f7' },
  { from: 'Brain', to: 'All agents', desc: 'Task routing, governance enforcement', color: '#f59e0b' },
  { from: 'All agents', to: 'Audit', desc: 'Deliverables for quality gate', color: '#ec4899' },
  { from: 'Discord', to: 'Brain + Agents', desc: 'Agent channels + Adam commands', color: '#5b9cf6' },
  { from: 'WhatsApp', to: 'Brain', desc: 'Client comms', color: '#25d366' },
]

export default function SystemPage() {
  const snap = useSnapshot()

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>System Map — Command Centre</title>
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#0a0a0a; color:#e0e0e0; padding:16px; }
          a { color:#3b82f6; text-decoration:none; }
          a:hover { text-decoration:underline; }
          .back { font-size:12px; margin-bottom:16px; display:inline-block; }
          .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:8px; }
          .header h1 { font-size:20px; color:#fff; }
          .meta { font-size:9px; color:#444; }
          
          .layer { margin-bottom:16px; }
          .layer-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid #1a1a1a; }
          .layer-name { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; }
          .layer-desc { font-size:9px; color:#555; }
          .layer-bar { width:3px; height:16px; border-radius:2px; }
          
          .node-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:8px; }
          @media(max-width:600px) { .node-grid { grid-template-columns:1fr; } }
          
          .node { background:#111; border:1px solid #222; border-radius:8px; padding:10px 12px; cursor:pointer; transition:border-color .2s; }
          .node:hover { border-color:#3b82f6; }
          .node-top { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
          .node-icon { font-size:14px; }
          .node-name { font-size:12px; font-weight:600; color:#fff; flex:1; }
          .node-desc { font-size:9px; color:#555; margin-bottom:6px; }
          .node-stats { display:flex; gap:8px; flex-wrap:wrap; }
          .node-stat { font-size:8px; color:#666; display:flex; align-items:center; gap:3px; }
          
          .flows { margin-top:20px; background:#111; border:1px solid #222; border-radius:10px; padding:14px; }
          .flows-title { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; font-weight:600; }
          .flow-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:6px; }
          .flow { display:flex; align-items:center; gap:8px; padding:6px 10px; background:#0a0a0a; border-radius:6px; border:1px solid #1a1a1a; }
          .flow-from { font-size:10px; font-weight:600; min-width:80px; }
          .flow-arrow { font-size:10px; color:#333; }
          .flow-to { font-size:10px; font-weight:600; min-width:80px; }
          .flow-desc { font-size:8px; color:#555; flex:1; }
          
          .infra { margin-top:16px; background:#111; border:1px solid #222; border-radius:10px; padding:14px; }
          .infra-title { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:600; }
          .infra-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:6px; }
          .infra-item { display:flex; align-items:center; gap:6px; padding:6px 10px; background:#0a0a0a; border-radius:6px; border:1px solid #1a1a1a; font-size:10px; }
        `}</style>
      </Head>

      <div>
        <a href="/" className="back">← Dashboard</a>
        <div className="header">
          <h1>🔌 System Architecture</h1>
          <span className="meta">
            {snap?.sessions?.totalAgents || '?'} agents · {snap?.sessions?.totalSessions || '?'} sessions · 
            Last sync: {snap?.timestamp ? timeAgo(snap.timestamp) : '—'}
          </span>
        </div>

        {/* Agent Layers */}
        {LAYERS.map(layer => (
          <div className="layer" key={layer.name}>
            <div className="layer-header">
              <div className="layer-bar" style={{ background: layer.color }}></div>
              <span className="layer-name" style={{ color: layer.color }}>{layer.name}</span>
              <span className="layer-desc">{layer.desc}</span>
            </div>
            <div className="node-grid">
              {layer.nodes.map(node => {
                const health = snap?.fleetHealth?.agents?.find(a => a.name === node.id)
                const agentSess = snap?.sessions?.byAgent?.[node.id]
                const hb = snap?.sessions?.heartbeats?.[node.id]
                const gov = snap?.governance?.agents?.find(a => a.name === node.id)
                const rpt = snap?.agentReports?.[node.id]
                return (
                  <a href={`/agent/${node.id}`} key={node.id} style={{textDecoration:'none'}}>
                    <div className="node" style={{ borderLeftColor: layer.color, borderLeftWidth: 2 }}>
                      <div className="node-top">
                        <span className="node-icon">{node.icon}</span>
                        <span className="node-name">{node.label}</span>
                        <Light ok={health?.healthy} />
                      </div>
                      <div className="node-desc">{node.desc}</div>
                      <div className="node-stats">
                        <span className="node-stat"><Light ok={health?.healthy} /> health</span>
                        <span className="node-stat"><Light ok={gov?.status === 'ok'} /> gov</span>
                        <span className="node-stat"><Light ok={hb === 'ok' ? true : hb === 'disabled' ? null : false} /> hb:{hb || '—'}</span>
                        {agentSess && <span className="node-stat">📊 {agentSess.avgContextPct}% ctx</span>}
                        {agentSess && <span className="node-stat">📡 {agentSess.sessions.length}s</span>}
                        {rpt && <span className="node-stat" style={{color:'#444'}}>📝 {timeAgo(rpt.lastUpdated)}</span>}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        ))}

        {/* Data Flow */}
        <div className="flows">
          <div className="flows-title">Data Flow</div>
          <div className="flow-grid">
            {DATA_FLOWS.map((flow, i) => (
              <div className="flow" key={i}>
                <span className="flow-from" style={{color:flow.color}}>{flow.from}</span>
                <span className="flow-arrow">→</span>
                <span className="flow-to" style={{color:flow.color}}>{flow.to}</span>
                <span className="flow-desc">{flow.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure */}
        <div className="infra">
          <div className="infra-title">Infrastructure</div>
          <div className="infra-grid">
            {snap?.infra?.items?.map((item, i) => (
              <div className="infra-item" key={i}>
                <Light ok={item.status === 'ok'} />
                {item.text}
              </div>
            ))}
            {snap?.gateway?.channels?.map((ch, i) => (
              <div className="infra-item" key={`ch-${i}`}>
                <Light ok={ch.state === 'OK'} />
                {ch.name}: {ch.state}
              </div>
            ))}
            <div className="infra-item">
              <Light ok={snap?.gateway?.status === 'running'} />
              Gateway: {snap?.gateway?.status || '—'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
