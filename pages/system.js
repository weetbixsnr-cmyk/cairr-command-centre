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
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }}></span>
}

/* ── The Pipeline ──
   This is the actual order of operations in the CAIRR system.
   Each step shows what triggers it, what it does, and what comes next.
*/

const PIPELINE = [
  {
    id: 'trigger',
    label: 'Trigger',
    icon: '⚡',
    color: '#f59e0b',
    desc: 'Something kicks off the work',
    items: [
      { label: 'Adam asks in Discord', detail: '#brain channel → Brain picks it up' },
      { label: 'Cron fires', detail: 'Morning Brief, EOD Wrap, Nightly Research, etc.' },
      { label: 'WhatsApp/Signal message', detail: 'Client or external → Gateway routes to Brain' },
      { label: 'Brain self-initiates', detail: 'Governance check, scheduled audit, research' },
    ]
  },
  {
    id: 'brain',
    label: 'Brain Routes',
    icon: '🧠',
    color: '#a855f7',
    desc: 'Brain decides which agent handles it',
    items: [
      { label: 'Reads the request', detail: 'Checks FRAMEWORK.md rules, agent capabilities' },
      { label: 'Routes to agent', detail: 'sessions_send → target agent\'s Discord channel' },
      { label: 'Sets expectations', detail: 'Deadline, quality bar, what "done" looks like' },
    ]
  },
  {
    id: 'dev',
    label: 'Agent Builds in dev/',
    icon: '🔨',
    color: '#3b82f6',
    desc: 'Agent does the work in their workspace',
    items: [
      { label: 'Work happens in dev/', detail: 'All edits in dev/ directory — never touch production' },
      { label: 'Git commits on agent branch', detail: 'agent/nbhw, agent/bts, agent/command-centre, etc.' },
      { label: 'Tests locally', detail: 'Build check, lint, manual verification' },
      { label: 'Writes to memory/', detail: 'Decision log, daily notes, failure log if things break' },
    ]
  },
  {
    id: 'audit',
    label: 'Audit Gate',
    icon: '🔍',
    color: '#ec4899',
    desc: 'Quality check before anything goes live',
    items: [
      { label: 'Agent submits to Audit', detail: 'Full content inline via sessions_send' },
      { label: 'Audit reviews', detail: 'Code quality, FRAMEWORK compliance, no secrets, no PII' },
      { label: 'Pass → approved', detail: 'Audit signs off, agent can deploy' },
      { label: 'Fail → back to dev/', detail: 'Feedback sent, agent fixes and resubmits' },
    ]
  },
  {
    id: 'staging',
    label: 'Staging / Preview',
    icon: '🔬',
    color: '#06b6d4',
    desc: 'Preview deploy before going live',
    items: [
      { label: 'Vercel preview deploy', detail: 'Auto-generated URL for each push' },
      { label: 'Brain reviews', detail: 'Checks output matches brief' },
      { label: 'Adam can preview', detail: 'Link shared in Discord for approval' },
    ]
  },
  {
    id: 'approve',
    label: 'Brain / Adam Approves',
    icon: '✅',
    color: '#10b981',
    desc: 'Final sign-off before production',
    items: [
      { label: 'Brain confirms', detail: 'Matches requirements, no regressions' },
      { label: 'Adam approves (if needed)', detail: 'Business decisions, design choices, client-facing' },
      { label: 'Deploy command issued', detail: 'vercel --prod or merge to main branch' },
    ]
  },
  {
    id: 'live',
    label: 'Live / Production',
    icon: '🚀',
    color: '#10b981',
    desc: 'Deployed and serving users',
    items: [
      { label: 'Vercel production deploy', detail: 'vercel --prod → live URL' },
      { label: 'Git push', detail: 'Committed and pushed to agent branch' },
      { label: 'Monitoring starts', detail: 'Dashboard snapshot picks it up on next 5-min cycle' },
    ]
  },
  {
    id: 'monitor',
    label: 'Monitoring Loop',
    icon: '📡',
    color: '#6366f1',
    desc: 'Continuous checks after deploy',
    items: [
      { label: 'push-snapshot.js (every 5m)', detail: 'Collects: openclaw status, git, agent workspaces, CodexBar, Vercel projects' },
      { label: 'Cost Circuit Breaker (hourly)', detail: 'Checks Claude spend — kills runaway agents' },
      { label: 'Governance Drift (daily 4am)', detail: 'Checks all agents have FRAMEWORK.md, correct config' },
      { label: 'Morning Brief (7am)', detail: 'Summary of overnight activity → Discord' },
      { label: 'EOD Wrap (6pm)', detail: 'Day summary, what to work on overnight' },
    ]
  },
]

const DATA_FLOW = [
  { from: 'Mac Mini', arrow: '→', to: 'OpenClaw Gateway', detail: 'All agents run locally', color: '#3b82f6' },
  { from: 'Gateway', arrow: '→', to: 'Discord / WhatsApp / Signal', detail: 'Message routing to channels', color: '#5b9cf6' },
  { from: 'Cron scheduler', arrow: '→', to: 'Agent sessions', detail: 'Timed tasks fire into isolated sessions', color: '#a855f7' },
  { from: 'push-snapshot.js', arrow: '→', to: 'public/snapshot.json', detail: 'Bundle all data → Vercel deploy', color: '#10b981' },
  { from: 'Dashboard', arrow: '←', to: '/api/data', detail: 'Reads bundled snapshot, 30s auto-refresh', color: '#f59e0b' },
  { from: 'Agent workspace', arrow: '→', to: 'Git (GitHub)', detail: 'Each agent pushes to their branch', color: '#ec4899' },
  { from: 'CodexBar', arrow: '→', to: 'Snapshot', detail: 'Claude cost data → dashboard', color: '#06b6d4' },
]

export default function SystemPage() {
  const snap = useSnapshot()

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>System Architecture — Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080a;color:#e0e0e0;padding:16px 20px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          
          .nav{display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .nav::-webkit-scrollbar{display:none}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px;white-space:nowrap;flex-shrink:0}
          .nav a:hover{border-color:#3b82f6}
          .nav a.active{border-color:#a855f7;color:#a855f7}
          
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:8px}
          .header h1{font-size:22px;color:#fff;letter-spacing:-0.5px}
          .meta{font-size:9px;color:#888}
          
          /* Pipeline flow */
          .pipeline{position:relative;padding-left:40px}
          .step{position:relative;margin-bottom:0;padding:16px 0}
          
          /* Vertical line */
          .pipeline::before{content:'';position:absolute;left:18px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#333 0%,#a855f7 10%,#3b82f6 30%,#ec4899 50%,#06b6d4 65%,#10b981 80%,#6366f1 100%)}
          
          /* Step dot */
          .step-dot{position:absolute;left:-30px;top:20px;width:14px;height:14px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;z-index:1;background:#08080a}
          
          /* Arrow between steps */
          .step-arrow{position:absolute;left:-26px;bottom:-8px;font-size:10px;color:#777;z-index:2}
          
          .step-card{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px 16px;transition:border-color .2s}
          .step-card:hover{border-color:#777}
          
          .step-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
          .step-icon{font-size:20px}
          .step-label{font-size:14px;font-weight:700;color:#fff}
          .step-num{font-size:9px;color:#999;background:#1a1a1a;padding:1px 6px;border-radius:4px;font-weight:600}
          
          .step-desc{font-size:10px;color:#aaa;margin-bottom:10px}
          
          .step-items{display:flex;flex-direction:column;gap:4px}
          .step-item{display:flex;align-items:flex-start;gap:8px;font-size:10px;padding:4px 8px;background:#0a0a0d;border-radius:6px;border:1px solid #151518}
          .step-item-label{color:#fff;font-weight:600;min-width:140px;flex-shrink:0}
          .step-item-detail{color:#999}
          
          @media(max-width:600px){
            .step-item{flex-direction:column;gap:2px}
            .step-item-label{min-width:0}
          }
          
          /* Data flow section */
          .flow-section{margin-top:32px;background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:16px}
          .flow-title{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:12px}
          .flow-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:6px}
          @media(max-width:600px){.flow-grid{grid-template-columns:1fr}}
          .flow-row{display:flex;align-items:center;gap:8px;padding:6px 10px;background:#0a0a0d;border-radius:6px;border:1px solid #151518;font-size:10px}
          .flow-from{font-weight:700;min-width:100px}
          .flow-arrow{color:#777;font-size:12px}
          .flow-to{font-weight:700;min-width:100px}
          .flow-detail{color:#999;flex:1;font-size:9px}
          
          /* Infra section */
          .infra-section{margin-top:16px;background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:16px}
          .infra-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;margin-top:8px}
          .infra-item{display:flex;align-items:center;gap:6px;padding:6px 10px;background:#0a0a0d;border-radius:6px;border:1px solid #151518;font-size:10px}
          
          .footer{font-size:8px;color:#1a1a1a;text-align:right;margin-top:24px}
        `}</style>
      </Head>

      <div>
        <div className="nav">
          <a href="/">🎯 Dashboard</a>
          <a href="/fleet">🏢 Fleet</a>
          <a href="/system" className="active">🔌 System</a>
          <a href="/ricky">🧠 Ricky</a>
        </div>

        <div className="header">
          <h1>🔌 System Architecture</h1>
          <span className="meta">
            The pipeline: what happens when, in order · {snap?.sessions?.totalAgents || '?'} agents · {snap?.sessions?.totalSessions || '?'} sessions
          </span>
        </div>

        {/* ── Pipeline Flow ── */}
        <div className="pipeline">
          {PIPELINE.map((step, i) => (
            <div className="step" key={step.id}>
              <div className="step-dot" style={{ borderColor: step.color }}>
              </div>
              {i < PIPELINE.length - 1 && <div className="step-arrow">↓</div>}
              <div className="step-card" style={{ borderLeftColor: step.color, borderLeftWidth: 3 }}>
                <div className="step-header">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-label">{step.label}</span>
                  <span className="step-num">Step {i + 1}</span>
                </div>
                <div className="step-desc">{step.desc}</div>
                <div className="step-items">
                  {step.items.map((item, j) => (
                    <div className="step-item" key={j}>
                      <span className="step-item-label">{item.label}</span>
                      <span className="step-item-detail">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Data Flow ── */}
        <div className="flow-section">
          <div className="flow-title">Data Flow — How information moves</div>
          <div className="flow-grid">
            {DATA_FLOW.map((flow, i) => (
              <div className="flow-row" key={i}>
                <span className="flow-from" style={{ color: flow.color }}>{flow.from}</span>
                <span className="flow-arrow">{flow.arrow}</span>
                <span className="flow-to" style={{ color: flow.color }}>{flow.to}</span>
                <span className="flow-detail">{flow.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Infrastructure ── */}
        <div className="infra-section">
          <div className="flow-title">Infrastructure — What's running</div>
          <div className="infra-grid">
            <div className="infra-item">
              <Light ok={snap?.gateway?.status === 'running'} />
              <strong>Gateway:</strong> {snap?.gateway?.status || '—'}
            </div>
            {snap?.gateway?.channels?.map((ch, i) => (
              <div className="infra-item" key={i}>
                <Light ok={ch.state === 'OK'} />
                <strong>{ch.name}:</strong> {ch.state}
              </div>
            ))}
            {snap?.infra?.items?.map((item, i) => (
              <div className="infra-item" key={`inf-${i}`}>
                <Light ok={item.status === 'ok'} />
                {item.text}
              </div>
            ))}
            <div className="infra-item">
              <Light ok={true} />
              <strong>Mac Mini:</strong> 192.168.0.70 · Apple Silicon
            </div>
            <div className="infra-item">
              <Light ok={true} />
              <strong>Dashboard:</strong> dashboard-secure-one.vercel.app
            </div>
            <div className="infra-item">
              <Light ok={true} />
              <strong>Snapshot:</strong> {snap?.timestamp ? `${timeAgo(snap.timestamp)} (78KB)` : '—'}
            </div>
          </div>
        </div>

        <div className="footer">System Architecture · {snap?.timestamp ? timeAgo(snap.timestamp) : 'no data'}</div>
      </div>
    </>
  )
}
