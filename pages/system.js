import Head from 'next/head'
import { useState, useEffect } from 'react'
import { buildDashboardSnapshot } from '../lib/dashboard-data'

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

function timeAgo(d) {
  if (!d) return '-'
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const DATA_FLOW = [
  { from: 'Manual update', to: 'public/data/bts-status.json', detail: 'BTS status, blockers, SEO seed data' },
  { from: 'Manual update', to: 'public/data/nbhw-status.json', detail: 'NBHW status, blockers, SEO seed data' },
  { from: 'Manual update', to: 'public/data/dashboard-status.json', detail: 'Dashboard status and action queue' },
  { from: '/api/data', to: 'Dashboard pages', detail: 'Aggregates project-owned status shape for existing pages' },
  { from: 'Future hooks', to: 'public/data', detail: 'Deferred until project-owned status contracts are agreed' }
]

export default function SystemPage({ initialSnapshot }) {
  const snap = useSnapshot(initialSnapshot)
  const hydrated = useHydrated()

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>System Status - Command Centre</title>
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
          .section{margin-bottom:16px;background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:16px}
          .section-title{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:12px}
          .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}
          @media(max-width:600px){.grid{grid-template-columns:1fr}}
          .card{background:#0a0a0d;border:1px solid #151518;border-radius:8px;padding:10px}
          .label{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
          .value{font-size:13px;color:#fff;font-weight:700}
          .detail{font-size:10px;color:#aaa;line-height:1.4;margin-top:4px}
          .flow-row{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:#0a0a0d;border-radius:6px;border:1px solid #151518;font-size:10px;margin-bottom:6px}
          .flow-from{font-weight:700;min-width:100px;color:#3b82f6}
          .flow-arrow{color:#777}
          .flow-to{font-weight:700;min-width:180px;color:#fff}
          .flow-detail{color:#999;flex:1}
          .footer{font-size:8px;color:#333;text-align:right;margin-top:24px}
        `}</style>
      </Head>

      <div>
        <div className="nav">
          <a href="/">Dashboard</a>
          <a href="/bts-seo">BTS SEO</a>
          <a href="/nbhw-seo">NBHW SEO</a>
          <a href="/system" className="active">System</a>
        </div>

        <div className="header">
          <h1>System Status</h1>
          <span className="meta">Manual data model · updated {hydrated ? timeAgo(snap?.timestamp) : '-'}</span>
        </div>

        <div className="section">
          <div className="section-title">Active Data Model</div>
          <div className="grid">
            <div className="card">
              <div className="label">Mode</div>
              <div className="value">{snap?.dataSource?.mode || '-'}</div>
              <div className="detail">The dashboard reads static project status JSON first.</div>
            </div>
            <div className="card">
              <div className="label">Agent snapshot</div>
              <div className="value">{snap?.dataSource?.agentSnapshot === false ? 'Removed' : 'Unknown'}</div>
              <div className="detail">No remote Command Centre agent branch snapshot is read by /api/data.</div>
            </div>
            <div className="card">
              <div className="label">OpenClaw CLI</div>
              <div className="value">{snap?.dataSource?.openclawCli === false ? 'Not called' : 'Unknown'}</div>
              <div className="detail">CLI diagnostics are parked rather than active status sources.</div>
            </div>
            <div className="card">
              <div className="label">Hooks</div>
              <div className="value">Deferred</div>
              <div className="detail">No project hooks are wired until BTS/NBHW status contracts are agreed.</div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Data Flow</div>
          {DATA_FLOW.map((item, i) => (
            <div className="flow-row" key={i}>
              <span className="flow-from">{item.from}</span>
              <span className="flow-arrow">{'->'}</span>
              <span className="flow-to">{item.to}</span>
              <span className="flow-detail">{item.detail}</span>
            </div>
          ))}
        </div>

        <div className="section">
          <div className="section-title">Parked Agent-Era Surfaces</div>
          <div className="detail">
            Fleet health, agent details, OpenClaw sessions, cron diagnostics, and governance drift APIs now return parked responses.
            They are kept for compatibility during cleanup, but they are no longer active dashboard truth.
          </div>
        </div>

        <div className="footer">Command Centre · de-agented system status</div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      initialSnapshot: buildDashboardSnapshot()
    }
  }
}
