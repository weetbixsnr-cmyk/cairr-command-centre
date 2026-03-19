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
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

function Light({ s }) {
  const c = s === 'ok' || s === true ? '#10b981' : s === 'warn' ? '#f59e0b' : s === 'fail' || s === false || s === 'error' ? '#ef4444' : '#333'
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }}></span>
}

function staleCheck(dateStr, thresholdHours = 24) {
  if (!dateStr) return 'unknown'
  const h = (Date.now() - new Date(dateStr).getTime()) / 3600000
  if (h > thresholdHours) return 'stale'
  if (h > thresholdHours / 2) return 'aging'
  return 'fresh'
}

function Section({ title, children }) {
  return (
    <div className="section">
      <div className="sec-t">{title}</div>
      {children}
    </div>
  )
}

export default function RickyPage() {
  const snap = useSnapshot()
  const sess = snap?.sessions
  const fh = snap?.fleetHealth
  const gw = snap?.gateway
  const crons = snap?.cronJobs || []
  const projects = snap?.vercelProjects || []
  const svc = snap?.services || {}

  // Duplicate detection for Vercel projects
  const nameCounts = {}
  projects.forEach(p => {
    const base = p.name.replace(/-\w{4}$/, '').replace(/-deploy$/, '').replace(/-repo$/, '')
    nameCounts[base] = (nameCounts[base] || 0) + 1
  })
  const duplicateBases = new Set(Object.keys(nameCounts).filter(k => nameCounts[k] > 1))

  function isDuplicate(name) {
    const base = name.replace(/-\w{4}$/, '').replace(/-deploy$/, '').replace(/-repo$/, '')
    return duplicateBases.has(base)
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ricky — Brain Operations View</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:16px 24px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px}
          .top h1{font-size:18px;color:#fff}
          .meta{font-size:9px;color:#888}
          .nav{display:flex;gap:8px;margin-bottom:16px}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px}
          .nav a:hover{border-color:#3b82f6}
          .nav a.active{border-color:#a855f7;color:#a855f7}

          .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          @media(max-width:900px){.grid{grid-template-columns:1fr}}
          .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
          @media(max-width:1100px){.grid3{grid-template-columns:1fr 1fr}}
          @media(max-width:700px){.grid3{grid-template-columns:1fr}}
          .full{grid-column:1/-1}

          .section{background:#111;border:1px solid #222;border-radius:10px;padding:12px 14px;overflow-x:auto}
          .sec-t{font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:4px}

          table{width:100%;border-collapse:collapse;font-size:10px}
          th{text-align:left;color:#999;font-weight:600;padding:4px 8px;border-bottom:1px solid #222;text-transform:uppercase;font-size:8px;letter-spacing:0.5px}
          td{padding:4px 8px;border-bottom:1px solid #1a1a1a;color:#aaa}
          tr:hover td{background:#0d0d0d}

          .tag{font-size:8px;padding:2px 6px;border-radius:4px;font-weight:600;display:inline-block}
          .tag.ok{background:#0a2a1a;color:#10b981}
          .tag.warn{background:#2a2000;color:#f59e0b}
          .tag.err{background:#3b1010;color:#ef4444}
          .tag.dup{background:#1a0a2a;color:#a855f7}
          .tag.off{background:#1a1a1a;color:#999}
          .tag.stale{background:#3b1010;color:#ef4444}
          .tag.aging{background:#2a2000;color:#f59e0b}
          .tag.fresh{background:#0a2a1a;color:#10b981}

          .svc-row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #1a1a1a;font-size:10px}
          .svc-row:last-child{border-bottom:none}
          .svc-name{color:#fff;font-weight:600;min-width:120px}
          .svc-detail{color:#aaa;flex:1}
          .svc-cost{color:#f59e0b;font-weight:600;min-width:80px;text-align:right}

          .footer{font-size:8px;color:#222;text-align:right;margin-top:16px}
        `}</style>
      </Head>

      <div>
        <div className="top">
          <h1>🧠 Ricky — Brain Operations View</h1>
          <span className="meta">
            Auto-refresh 30s · Last sync: {snap?.timestamp ? timeAgo(snap.timestamp) : '—'}
          </span>
        </div>

        <div className="nav">
          <a href="/">🎯 Dashboard</a>
          <a href="/fleet">🏢 Fleet</a>
          <a href="/system">🔌 System</a>
          <a href="/ricky" className="active">🧠 Ricky</a>
        </div>

        <div className="grid3">

          {/* ── Vercel Projects ── */}
          <Section title={`Vercel Projects (${projects.length})`}>
            <table>
              <thead><tr><th></th><th>Project</th><th>URL</th><th>Updated</th><th>Flags</th></tr></thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={i}>
                    <td><Light s={p.url ? 'ok' : 'warn'} /></td>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{p.name}</td>
                    <td>{p.url ? <a href={p.url} target="_blank" rel="noopener">{p.url.replace('https://', '').substring(0, 35)}</a> : <span style={{ color: '#555' }}>No deploy</span>}</td>
                    <td>{p.updated || '—'}</td>
                    <td>
                      {isDuplicate(p.name) && <span className="tag dup">DUP?</span>}
                      {!p.url && <span className="tag warn">NO URL</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ── Active Crons ── */}
          <Section title={`Active Crons (${crons.length})`}>
            <table>
              <thead><tr><th></th><th>Name</th><th>Schedule</th><th>Model</th><th>Agent</th><th>Last Run</th><th>Next</th><th>Status</th></tr></thead>
              <tbody>
                {crons.map((c, i) => {
                  const status = c.lastStatus || 'unknown'
                  const statusClass = status === 'ok' ? 'ok' : status === 'error' ? 'err' : status === 'skipped' ? 'warn' : 'off'
                  return (
                    <tr key={i}>
                      <td><Light s={status === 'ok' ? 'ok' : status === 'error' ? 'fail' : 'warn'} /></td>
                      <td style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ color: '#666', fontSize: 9 }}>{c.everyMs ? `every ${c.everyMs / 60000}m` : c.schedule}</td>
                      <td style={{ fontSize: 9 }}>{c.model ? c.model.split('/').pop() : '—'}</td>
                      <td>{c.agentId}</td>
                      <td>{c.lastRunAt ? timeAgo(c.lastRunAt) : '—'}</td>
                      <td>{c.nextRunAt ? timeAgo(c.nextRunAt) : '—'}</td>
                      <td><span className={`tag ${statusClass}`}>{status.toUpperCase()}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Section>

          {/* ── Agent Fleet ── */}
          <Section title={`Agent Fleet (${fh?.total || 0} agents)`}>
            <table>
              <thead><tr><th></th><th>Agent</th><th>Model</th><th>Sessions</th><th>Context</th><th>🗜️</th><th>Heartbeat</th><th>Gov</th><th>Last Active</th></tr></thead>
              <tbody>
                {fh?.agents?.map((agent, i) => {
                  const agentSess = sess?.byAgent?.[agent.name]
                  const hb = sess?.heartbeats?.[agent.name]
                  const gov = snap?.governance?.agents?.find(a => a.name === agent.name)
                  const rpt = snap?.agentReports?.[agent.name]
                  const freshness = rpt?.lastUpdated ? staleCheck(rpt.lastUpdated) : 'unknown'
                  return (
                    <tr key={i}>
                      <td><Light s={agent.healthy} /></td>
                      <td><a href={`/agent/${agent.name}`} style={{ color: '#fff', fontWeight: 600 }}>{agent.name}</a></td>
                      <td style={{ fontSize: 9, color: '#666' }}>{agentSess?.model ? agentSess.model.split('/').pop() : '—'}</td>
                      <td>{agentSess?.sessions?.length || 0}</td>
                      <td>
                        {agentSess?.avgContextPct != null ? (
                          <span style={{ color: agentSess.avgContextPct > 80 ? '#ef4444' : agentSess.avgContextPct > 50 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                            {agentSess.avgContextPct}%
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ color: (agentSess?.compactionCount || 0) >= 2 ? '#ef4444' : (agentSess?.compactionCount || 0) >= 1 ? '#f59e0b' : '#555' }}>
                        {agentSess?.compactionCount || 0}
                      </td>
                      <td><span className={`tag ${hb === 'ok' ? 'ok' : hb === 'disabled' ? 'off' : 'warn'}`}>{hb || '—'}</span></td>
                      <td><span className={`tag ${gov?.status === 'ok' ? 'ok' : 'warn'}`}>{gov?.status || '—'}</span></td>
                      <td>
                        {rpt?.lastUpdated ? (
                          <span className={`tag ${freshness}`}>{timeAgo(rpt.lastUpdated)}</span>
                        ) : <span className="tag off">no report</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Section>

          {/* ── Services Map ── */}
          <Section title="Services & Costs">
            {svc.hosting && (
              <>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 8 }}>Hosting</div>
                {svc.hosting.map((s, i) => (
                  <div className="svc-row" key={i}>
                    <Light s="ok" />
                    <span className="svc-name">{s.name}</span>
                    <span className="svc-detail">{s.plan} — {s.notes}</span>
                    <span className="svc-cost">{s.cost}</span>
                  </div>
                ))}
              </>
            )}
            {svc.domains && (
              <>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>Domains</div>
                {svc.domains.map((s, i) => (
                  <div className="svc-row" key={i}>
                    <Light s="ok" />
                    <span className="svc-name">{s.name}</span>
                    <span className="svc-detail">{s.registrar} · Renewal: {s.renewal}</span>
                    <span className="svc-cost">{s.cost}</span>
                  </div>
                ))}
              </>
            )}
            {svc.comms && (
              <>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>Communications</div>
                {svc.comms.map((s, i) => (
                  <div className="svc-row" key={i}>
                    <Light s="ok" />
                    <span className="svc-name">{s.name}</span>
                    <span className="svc-detail">{s.plan || ''} {s.notes ? `— ${s.notes}` : ''}</span>
                    <span className="svc-cost">{s.cost}</span>
                  </div>
                ))}
              </>
            )}
            {svc.ai && (
              <>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>AI Providers</div>
                {svc.ai.map((s, i) => (
                  <div className="svc-row" key={i}>
                    <Light s="ok" />
                    <span className="svc-name">{s.name}</span>
                    <span className="svc-detail">{s.plan} — {s.notes}</span>
                    <span className="svc-cost"></span>
                  </div>
                ))}
              </>
            )}
            {/* Monthly total */}
            <div style={{ borderTop: '1px solid #333', marginTop: 12, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>EST. MONTHLY (excl. AI API)</span>
              <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>~$28.80/mo + ~$144/yr domains</span>
            </div>
          </Section>

          {/* ── Infrastructure ── */}
          <Section title="Infrastructure">
            {svc.infra && (
              <>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Mac Mini</div>
                <div className="svc-row">
                  <Light s="ok" />
                  <span className="svc-name">{svc.infra.macMini.ip}</span>
                  <span className="svc-detail">{svc.infra.macMini.os} · {svc.infra.macMini.chip} · {svc.infra.macMini.role}</span>
                </div>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>Dev Ports</div>
                {svc.infra.ports.map((p, i) => (
                  <div className="svc-row" key={i}>
                    <span style={{ fontFamily: 'monospace', color: '#3b82f6', fontWeight: 600, minWidth: 60, fontSize: 10 }}>:{p.port}</span>
                    <span className="svc-detail">{p.service}</span>
                  </div>
                ))}
              </>
            )}
            {gw && (
              <>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>Gateway</div>
                <div className="svc-row">
                  <Light s={gw.status === 'running' ? 'ok' : 'fail'} />
                  <span className="svc-name">Status</span>
                  <span className="svc-detail">{gw.status} · {gw.agents} · {gw.sessions}</span>
                </div>
                {gw.channels?.map((ch, i) => (
                  <div className="svc-row" key={i}>
                    <Light s={ch.state === 'OK' ? 'ok' : 'warn'} />
                    <span className="svc-name">{ch.name}</span>
                    <span className="svc-detail">{ch.state}</span>
                  </div>
                ))}
              </>
            )}
          </Section>

          {/* ── Claude Cost (CodexBar) ── */}
          <Section title="Claude Cost (CodexBar)">
            {snap?.claudeCost ? (
              <>
                <div style={{ display: 'flex', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase' }}>Today / Session</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>${snap.claudeCost.session.cost.toFixed(2)}</div>
                    <div style={{ fontSize: 9, color: '#444' }}>{(snap.claudeCost.session.tokens / 1000000).toFixed(1)}M tokens</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase' }}>Last 30 Days</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>${snap.claudeCost.last30Days.cost.toFixed(2)}</div>
                    <div style={{ fontSize: 9, color: '#444' }}>{(snap.claudeCost.last30Days.tokens / 1000000).toFixed(1)}M tokens</div>
                  </div>
                </div>
                {snap.claudeCost.daily?.length > 0 && (
                  <table>
                    <thead><tr><th>Date</th><th>Cost</th><th>Tokens</th><th>Models</th></tr></thead>
                    <tbody>
                      {snap.claudeCost.daily.map((d, i) => (
                        <tr key={i}>
                          <td style={{ color: '#fff' }}>{d.date}</td>
                          <td style={{ color: '#f59e0b', fontWeight: 600 }}>${d.cost.toFixed(2)}</td>
                          <td>{(d.tokens / 1000000).toFixed(1)}M</td>
                          <td style={{ fontSize: 8 }}>{d.models.map(m => m.replace('claude-', '')).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div style={{ fontSize: 8, color: '#333', marginTop: 8 }}>Source: CodexBar local JSONL · Updated: {timeAgo(snap.claudeCost.updatedAt)}</div>
              </>
            ) : <div style={{ color: '#555', fontSize: 11 }}>CodexBar data not available</div>}
          </Section>

          {/* ── Bitwarden Vault ── */}
          <Section title="Bitwarden Vault (Folders)">
            {svc.bitwarden?.folders?.map((f, i) => (
              <div className="svc-row" key={i}>
                <Light s="ok" />
                <span className="svc-name">{f.name}</span>
                <span className="svc-detail">{f.items} items</span>
              </div>
            ))}
            <div style={{ fontSize: 8, color: '#333', marginTop: 8 }}>Folder names only — no secrets exposed</div>
          </Section>

        </div>

        <div className="footer">🧠 Ricky — Brain Operations View · Auto-refresh 30s · {snap?.timestamp ? `Snapshot: ${timeAgo(snap.timestamp)}` : 'No data'}</div>
      </div>
    </>
  )
}
