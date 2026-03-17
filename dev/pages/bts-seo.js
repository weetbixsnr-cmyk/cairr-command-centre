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

function CoverageCell({ status }) {
  if (status === 'published') return <span style={{ background: '#0a2a1a', color: '#10b981', padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 700 }}>✅ LIVE</span>
  if (status === 'draft') return <span style={{ background: '#2a2000', color: '#f59e0b', padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 700 }}>📝 DRAFT</span>
  if (status === 'planned') return <span style={{ background: '#1a0a2a', color: '#a855f7', padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 700 }}>📋 PLANNED</span>
  return <span style={{ background: '#1a1a1a', color: '#333', padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 700 }}>—</span>
}

function TabBtn({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: '6px 14px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontWeight: 600, transition: 'all .15s',
      background: active ? '#111' : 'transparent', borderColor: active ? '#3b82f6' : '#222', color: active ? '#3b82f6' : '#555'
    }}>{label}</button>
  )
}

export default function BtsSeoPage() {
  const snap = useSnapshot()
  const plan = snap?.btsSeo
  const blogs = snap?.btsBlogInventory
  const [tab, setTab] = useState('matrix')

  if (!plan) return (
    <div style={{ fontFamily: '-apple-system, sans-serif', background: '#08080a', color: '#555', minHeight: '100vh', padding: 40, textAlign: 'center' }}>
      <h2 style={{ color: '#fff', marginBottom: 8 }}>🎓 BTS SEO</h2>
      <p>Waiting for data from BTS agent...</p>
      <a href="/" style={{ color: '#3b82f6', fontSize: 12 }}>← Dashboard</a>
    </div>
  )

  const services = plan.services || []
  const allLocations = [
    ...(plan.locations?.tier1 || []),
    ...(plan.locations?.tier2 || []),
    ...(plan.locations?.tier3 || []),
  ]
  const tier4 = plan.locations?.tier4 || []

  // Build coverage matrix: which location × service combos have content
  const plannedBlogs = blogs?.planned || []
  const publishedBlogs = blogs?.published || []

  // Coverage lookup
  function getCoverage(location, service) {
    // Check published blogs
    const pub = [...publishedBlogs].find(b =>
      b.title?.toLowerCase().includes(location.toLowerCase()) &&
      b.service?.toLowerCase().includes(service.toLowerCase())
    )
    if (pub) return 'published'
    const pl = plannedBlogs.find(b =>
      (b.title?.toLowerCase().includes(location.toLowerCase()) ||
       b.keywords?.some(k => k.toLowerCase().includes(location.toLowerCase()))) &&
      b.service?.toLowerCase().includes(service.toLowerCase())
    )
    if (pl) return 'planned'
    return 'gap'
  }

  // Stats
  const totalCombos = allLocations.length * services.length
  const publishedCount = blogs?.published || 0
  const plannedCount = plannedBlogs.length
  const gapCount = totalCombos - publishedCount

  // Content waves
  const waves = [
    { id: 1, label: 'Wave 1 (This week)', status: 'active', items: plan.plannedContent?.wave1 || [] },
    { id: 2, label: 'Wave 2 (Weeks 3-4)', status: 'planned', items: plan.plannedContent?.wave2 || [] },
    { id: 3, label: 'Wave 3 (Month 2)', status: 'future', items: plan.plannedContent?.wave3 || [] },
    { id: 4, label: 'Wave 4 (Month 3)', status: 'future', items: plan.plannedContent?.wave4 || [] },
  ]

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BTS SEO — Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080a;color:#e0e0e0;padding:16px 20px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          
          .nav{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px}
          .nav a:hover{border-color:#3b82f6}
          .nav a.active{border-color:#10b981;color:#10b981}
          
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px}
          .header h1{font-size:20px;color:#fff}
          .meta{font-size:9px;color:#444}
          
          .stats{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
          .stat{padding:10px 14px;background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;text-align:center;min-width:100px}
          .stat-val{font-size:22px;font-weight:800}
          .stat-lbl{font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-top:2px}
          
          .tabs{display:flex;gap:6px;margin-bottom:16px}
          
          .section{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px;margin-bottom:14px}
          .sec-t{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:4px}
          
          table{width:100%;border-collapse:collapse;font-size:10px}
          th{text-align:left;font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.5px;padding:4px 6px;border-bottom:1px solid #222;position:sticky;top:0;background:#0d0d10}
          td{padding:4px 6px;border-bottom:1px solid #111;color:#aaa}
          tr:hover td{background:#0a0a0d}
          
          .matrix-wrap{overflow-x:auto;max-height:500px;overflow-y:auto}
          
          .wave{background:#0a0a0d;border:1px solid #151518;border-radius:8px;padding:10px;margin-bottom:8px}
          .wave-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
          .wave-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
          .wave-label{font-size:12px;font-weight:700;color:#fff}
          .wave-status{font-size:9px;font-weight:600;text-transform:uppercase}
          .wave-item{font-size:10px;color:#888;padding:3px 0;padding-left:16px;border-bottom:1px solid #111}
          .wave-item:last-child{border-bottom:none}
          
          .client-card{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:14px;margin-bottom:14px}
          .client-row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #111;font-size:10px}
          .client-row:last-child{border-bottom:none}
          .client-label{color:#555;font-weight:600;min-width:100px}
          .client-val{color:#ccc}
          
          .gap-row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #111;font-size:10px}
          .gap-row:last-child{border-bottom:none}
          .gap-priority{font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px}
          .p1{background:#3b1010;color:#ef4444}
          .p2{background:#2a2000;color:#f59e0b}
          .p3{background:#0e1a2e;color:#3b82f6}
          
          .blog-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #111;font-size:10px}
          .blog-row:last-child{border-bottom:none}
          .blog-title{color:#fff;font-weight:600;flex:1}
          .blog-kw{font-size:8px;color:#555}
          
          .footer{font-size:8px;color:#1a1a1a;text-align:right;margin-top:16px}
        `}</style>
      </Head>

      <div>
        <div className="nav">
          <a href="/">🎯 Dashboard</a>
          <a href="/fleet">🏢 Fleet</a>
          <a href="/system">🔌 System</a>
          <a href="/ricky">🧠 Ricky</a>
          <a href="/bts-seo" className="active">🎓 BTS SEO</a>
        </div>

        <div className="header">
          <h1>🎓 BTS — SEO Command</h1>
          <span className="meta">
            {plan.client} · {plan.owner} · {plan.revenue} · Updated: {plan.updatedAt ? timeAgo(plan.updatedAt) : '—'}
          </span>
        </div>

        {/* Client Job Card */}
        <div className="client-card">
          <div className="sec-t">Sunny's Job Card — {plan.revenue}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Delivered This Month</div>
              <div className="client-row"><span className="client-val">{publishedCount > 0 ? `${publishedCount} blog posts published` : 'Content pipeline starting'}</span></div>
              <div className="client-row"><span className="client-val">SEO strategy & keyword matrix built</span></div>
              <div className="client-row"><span className="client-val">{plan.keywordCoverage?.tracked || 0} keywords tracked</span></div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>In Progress</div>
              {plannedBlogs.filter(b => b.status === 'in-progress').length > 0
                ? plannedBlogs.filter(b => b.status === 'in-progress').map((b, i) => (
                    <div className="client-row" key={i}><span className="client-val">📝 {b.title}</span></div>
                  ))
                : <div className="client-row"><span className="client-val" style={{ color: '#555' }}>Wave 1 blogs queued</span></div>
              }
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Next Up</div>
              {(plan.plannedContent?.wave1 || []).map((item, i) => (
                <div className="client-row" key={i}><span className="client-val">{item}</span></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Monthly Checklist</div>
              <div className="client-row"><span style={{ color: '#10b981' }}>✅</span> <span className="client-val">Keyword research</span></div>
              <div className="client-row"><span style={{ color: '#10b981' }}>✅</span> <span className="client-val">Location targeting plan</span></div>
              <div className="client-row"><span style={{ color: '#10b981' }}>✅</span> <span className="client-val">Competitor analysis</span></div>
              <div className="client-row"><span style={{ color: '#f59e0b' }}>⏳</span> <span className="client-val">Blog posts ({publishedCount}/8 target)</span></div>
              <div className="client-row"><span style={{ color: '#555' }}>⬜</span> <span className="client-val">GBP posts</span></div>
              <div className="client-row"><span style={{ color: '#555' }}>⬜</span> <span className="client-val">Ranking report to Sunny</span></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat">
            <div className="stat-val" style={{ color: '#3b82f6' }}>{plan.keywordCoverage?.tracked || 0}</div>
            <div className="stat-lbl">Keywords Tracked</div>
          </div>
          <div className="stat">
            <div className="stat-val" style={{ color: '#ef4444' }}>{plan.keywordCoverage?.locationTargeted || 0}</div>
            <div className="stat-lbl">Location Targeted</div>
          </div>
          <div className="stat">
            <div className="stat-val" style={{ color: '#a855f7' }}>{plan.locations?.total || 0}</div>
            <div className="stat-lbl">Target Locations</div>
          </div>
          <div className="stat">
            <div className="stat-val" style={{ color: '#10b981' }}>{publishedCount}</div>
            <div className="stat-lbl">Published</div>
          </div>
          <div className="stat">
            <div className="stat-val" style={{ color: '#f59e0b' }}>{plannedCount}</div>
            <div className="stat-lbl">Planned</div>
          </div>
          <div className="stat">
            <div className="stat-val" style={{ color: '#ef4444' }}>{services.length * allLocations.length}</div>
            <div className="stat-lbl">Total Combos</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <TabBtn active={tab === 'matrix'} label="📊 Coverage Matrix" onClick={() => setTab('matrix')} />
          <TabBtn active={tab === 'blogs'} label="📝 Blog Inventory" onClick={() => setTab('blogs')} />
          <TabBtn active={tab === 'gaps'} label="🔴 Gaps" onClick={() => setTab('gaps')} />
          <TabBtn active={tab === 'pipeline'} label="🔨 Pipeline" onClick={() => setTab('pipeline')} />
          <TabBtn active={tab === 'competitors'} label="🏆 Competitors" onClick={() => setTab('competitors')} />
        </div>

        {/* ── Coverage Matrix ── */}
        {tab === 'matrix' && (
          <div className="section">
            <div className="sec-t">Location × Service Coverage</div>
            <div className="matrix-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth: 120 }}>Location</th>
                    <th style={{ fontSize: 7, color: '#444' }}>Tier</th>
                    {services.map(s => <th key={s} style={{ minWidth: 80, fontSize: 7 }}>{s.replace(' Training', '').replace(' Testing', '')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: 'T1', locations: plan.locations?.tier1 || [], color: '#10b981' },
                    { tier: 'T2', locations: plan.locations?.tier2 || [], color: '#3b82f6' },
                    { tier: 'T3', locations: plan.locations?.tier3 || [], color: '#f59e0b' },
                  ].map(group => group.locations.map(loc => (
                    <tr key={loc}>
                      <td style={{ color: '#fff', fontWeight: 600 }}>{loc}</td>
                      <td><span style={{ color: group.color, fontSize: 8, fontWeight: 700 }}>{group.tier}</span></td>
                      {services.map(svc => (
                        <td key={svc}><CoverageCell status={getCoverage(loc, svc)} /></td>
                      ))}
                    </tr>
                  )))}
                  {/* Tier 4 broad areas */}
                  {tier4.map(area => (
                    <tr key={area}>
                      <td style={{ color: '#888' }}>{area}</td>
                      <td><span style={{ color: '#555', fontSize: 8, fontWeight: 700 }}>T4</span></td>
                      {services.map(svc => (
                        <td key={svc}><CoverageCell status={getCoverage(area, svc)} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Blog Inventory ── */}
        {tab === 'blogs' && (
          <div className="section">
            <div className="sec-t">Blog Inventory ({publishedCount} published, {plannedCount} planned)</div>
            {publishedCount === 0 && plannedCount === 0 && (
              <div style={{ color: '#333', fontSize: 11, fontStyle: 'italic', padding: 8 }}>No blogs yet — pipeline starts this week</div>
            )}
            {plannedBlogs.map((blog, i) => (
              <div className="blog-row" key={i}>
                <CoverageCell status={blog.status === 'not-started' ? 'planned' : blog.status} />
                <span className="blog-title">{blog.title}</span>
                <span style={{ fontSize: 9, color: '#555' }}>{blog.service}</span>
                <div className="blog-kw">{blog.keywords?.join(' · ')}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Gaps ── */}
        {tab === 'gaps' && (
          <div className="section">
            <div className="sec-t">Content Gaps — Priority Order</div>
            {(plan.contentGaps || []).map((gap, i) => (
              <div className="gap-row" key={i}>
                <span className={`gap-priority p${gap.priority}`}>P{gap.priority}</span>
                <span style={{ color: '#fff', fontWeight: 600, flex: 1 }}>{gap.gap}</span>
                <span style={{ color: '#555', fontSize: 9 }}>{gap.note}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <div className="sec-t">Keyword Categories — Coverage</div>
              {plan.keywordCoverage?.categories && Object.entries(plan.keywordCoverage.categories).map(([cat, count]) => (
                <div className="gap-row" key={cat}>
                  <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 9, minWidth: 20 }}>{count}</span>
                  <span style={{ color: '#aaa', flex: 1, textTransform: 'capitalize' }}>{cat.replace(/([A-Z])/g, ' $1')}</span>
                  <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 600 }}>0 with location targeting</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Content Pipeline ── */}
        {tab === 'pipeline' && (
          <div className="section">
            <div className="sec-t">Content Pipeline — 4 Waves</div>
            {waves.map(wave => {
              const dotColor = wave.status === 'active' ? '#ef4444' : wave.status === 'planned' ? '#f59e0b' : '#333'
              const statusLabel = wave.status === 'active' ? '🔴 NOW' : wave.status === 'planned' ? '🟡 NEXT' : '⬜ LATER'
              return (
                <div className="wave" key={wave.id}>
                  <div className="wave-header">
                    <div className="wave-dot" style={{ background: dotColor }}></div>
                    <span className="wave-label">{wave.label}</span>
                    <span className="wave-status" style={{ color: dotColor }}>{statusLabel}</span>
                    <span style={{ fontSize: 9, color: '#555', marginLeft: 'auto' }}>{wave.items.length} items</span>
                  </div>
                  {wave.items.map((item, i) => (
                    <div className="wave-item" key={i}>• {item}</div>
                  ))}
                </div>
              )
            })}
            <div style={{ marginTop: 12 }}>
              <div className="sec-t">Cadence</div>
              <div className="client-row"><span className="client-label">Blogs</span><span className="client-val">{plan.cadence?.blogs}</span></div>
              <div className="client-row"><span className="client-label">GBP Posts</span><span className="client-val">{plan.cadence?.gbpPosts}</span></div>
              <div className="client-row"><span className="client-label">Rankings</span><span className="client-val">{plan.cadence?.rankingSnapshot}</span></div>
              <div className="client-row"><span className="client-label">Competitors</span><span className="client-val">{plan.cadence?.competitorCheck}</span></div>
              <div className="client-row"><span className="client-label">Report</span><span className="client-val">{plan.cadence?.summaryReport}</span></div>
            </div>
          </div>
        )}

        {/* ── Competitors ── */}
        {tab === 'competitors' && (
          <div className="section">
            <div className="sec-t">Competitor Watch ({(plan.competitors || []).length})</div>
            {(plan.competitors || []).map((comp, i) => (
              <div className="gap-row" key={i}>
                <span style={{ fontSize: 14 }}>🏆</span>
                <span style={{ color: '#fff', fontWeight: 600, flex: 1 }}>{comp}</span>
                <span style={{ color: '#555', fontSize: 9 }}>Baseline scan pending</span>
              </div>
            ))}
            <div style={{ fontSize: 9, color: '#333', marginTop: 8 }}>Competitor ranking data will appear here after first scan</div>
          </div>
        )}

        <div className="footer">🎓 BTS SEO · {plan.site} · {plan.revenue} · {snap?.timestamp ? timeAgo(snap.timestamp) : 'no data'}</div>
      </div>
    </>
  )
}
