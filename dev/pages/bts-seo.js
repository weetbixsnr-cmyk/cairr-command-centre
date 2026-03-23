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
  if (m < 1) return 'now'; if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function PosCell({ pos }) {
  if (pos === 1) return <span style={{color:'#10b981',fontWeight:700}}>🥇 #1</span>
  if (pos === 2) return <span style={{color:'#f59e0b',fontWeight:700}}>🥈 #2</span>
  if (pos <= 5) return <span style={{color:'#3b82f6',fontWeight:600}}>#{pos}</span>
  if (pos <= 10) return <span style={{color:'#888'}}>#{pos}</span>
  return <span style={{color:'#ef4444'}}>50+</span>
}

function ThreatDot({ level }) {
  const c = level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981'
  return <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:c,marginRight:4}}></span>
}

function WaveBar({ wave, type }) {
  const colors = { active: '#ef4444', planned: '#f59e0b', future: '#333' }
  const spPct = wave.servicePagesTotal > 0 ? Math.round((wave.servicePages / wave.servicePagesTotal) * 100) : 0
  const items = type === 'locations' ? wave.locations : wave.suburbs
  return (
    <div style={{background:'#111',border:'1px solid #222',borderRadius:8,padding:10,marginBottom:6}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
        <span style={{width:8,height:8,borderRadius:'50%',background:colors[wave.status] || '#333',flexShrink:0}}></span>
        <span style={{fontSize:12,fontWeight:600,color:'#fff'}}>Wave {wave.id}</span>
        <span style={{fontSize:9,color:wave.status === 'active' ? '#ef4444' : '#555',fontWeight:600,textTransform:'uppercase'}}>
          {wave.status === 'active' ? '🔴 NOW' : wave.status === 'planned' ? '🟡 PLANNED' : '⬜ FUTURE'}
        </span>
        <span style={{fontSize:9,color:'#999',marginLeft:'auto'}}>
          {wave.servicePages}/{wave.servicePagesTotal} pages · {wave.blogs || 0} blogs
        </span>
      </div>
      <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginBottom:4,overflow:'hidden'}}>
        <div style={{height:4,width:`${spPct}%`,background:colors[wave.status] || '#333',borderRadius:2,minWidth: spPct > 0 ? 4 : 0}}></div>
      </div>
      {items?.length > 0 && (
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:4}}>
          {items.map(s => (
            <span key={s} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'#1a1a1a',border:'1px solid #222',color:'#aaa'}}>{s}</span>
          ))}
        </div>
      )}
      <div style={{fontSize:9,color:'#999'}}>{wave.scope}</div>
    </div>
  )
}

function TabButton({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize:11, padding:'6px 14px', borderRadius:6, border:'1px solid', cursor:'pointer', fontWeight:600, transition:'all .15s',
      background: active ? '#111' : 'transparent',
      borderColor: active ? '#3b82f6' : '#222',
      color: active ? '#3b82f6' : '#555'
    }}>{label}</button>
  )
}

export default function BtsSeoPage() {
  const snap = useSnapshot()
  const seo = snap?.btsSeo
  const comp = snap?.btsCompetitors
  const plan = snap?.btsSeoplan
  const blogs = snap?.btsBlogInventory
  const kw = snap?.btsKeywords
  const [tab, setTab] = useState('rankings')

  // Stats
  const totalKeywords = kw?.keywords?.length || 0
  const ranking = kw?.keywords?.filter(k => k.latest != null && k.latest <= 10).length || 0
  const locationsCovered = seo?.locationCoverage?.summary?.withContent || 0
  const locationsTotal = seo?.locationCoverage?.summary?.totalLocations || 0
  const servicePages = seo?.locationCoverage?.summary?.servicePages || 0
  const servicePagesNeeded = seo?.locationCoverage?.waves?.reduce((a, w) => a + (w.servicePagesTotal || 0), 0) || 0
  const blogCount = blogs?.published || 0
  const services = plan?.services?.length || seo?.assets?.trainingServices || 0

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BTS SEO — Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:16px 24px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          .back{font-size:12px;margin-bottom:16px;display:inline-block}
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px}
          .header h1{font-size:20px;color:#fff}
          .meta{font-size:9px;color:#888}
          .stats{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
          .stat-card{padding:12px 16px;background:#111;border:1px solid #222;border-radius:10px;text-align:center;min-width:120px}
          .stat-val{font-size:24px;font-weight:700}
          .stat-lbl{font-size:9px;color:#999;margin-top:2px}
          .section{margin-bottom:20px}
          .sec-title{font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:4px}
          .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          @media(max-width:600px){.grid2{grid-template-columns:1fr}}
          .card{background:#111;border:1px solid #222;border-radius:10px;padding:12px}
          table{width:100%;border-collapse:collapse;font-size:11px}
          th{text-align:left;font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-bottom:1px solid #222}
          td{padding:5px 8px;border-bottom:1px solid #1a1a1a;color:#aaa}
          tr:last-child td{border-bottom:none}
          .win{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:10px;color:#aaa;border-bottom:1px solid #1a1a1a}
          .win:last-child{border-bottom:none}
        `}</style>
      </Head>

      <div>
        <a href="/" className="back">← Dashboard</a>
        <div className="header">
          <h1>🎓 BTS — SEO Command</h1>
          <span className="meta">
            Client: {seo?.owner || 'Sunny'} · {seo?.revenue || '£300/mo'} · Updated: {seo ? timeAgo(seo.lastUpdated) : '—'}
          </span>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-val" style={{color: ranking > 0 ? '#10b981' : '#ef4444'}}>{ranking}/{totalKeywords}</div>
            <div className="stat-lbl">Keywords in Top 10</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color: servicePages > 0 ? '#10b981' : '#ef4444'}}>{servicePages}</div>
            <div className="stat-lbl">Location Pages Live</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#3b82f6'}}>{blogCount}</div>
            <div className="stat-lbl">Blog Posts Live</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#f59e0b'}}>{servicePagesNeeded - servicePages}</div>
            <div className="stat-lbl">Locations Remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#a855f7'}}>{services}</div>
            <div className="stat-lbl">Training Services</div>
          </div>
        </div>

        {/* Publish Safety Strip — always visible */}
        {(() => {
          const btsL = snap?.btsPublishLedger
          const st = btsL?.status || 'green'
          const brC = st === 'red' ? '#ef4444' : st === 'amber' ? '#f59e0b' : '#10b981'
          return (
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:140,background:'#0d0d10',border:`1px solid ${brC}33`,borderRadius:8,padding:'8px 14px',borderLeft:`3px solid ${brC}`}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:18,fontWeight:800,color:brC}}>{btsL?.last7d?.pages || 0}/{btsL?.weeklyPageLimit || 3}</span>
                  <span style={{fontSize:9,color:'#888'}}>pages this week</span>
                </div>
                <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginTop:4,overflow:'hidden'}}>
                  <div style={{height:4,width:`${Math.min(100,((btsL?.last7d?.pages||0)/(btsL?.weeklyPageLimit||3))*100)}%`,background:brC,borderRadius:2}}></div>
                </div>
              </div>
              <div style={{flex:1,minWidth:140,background:'#0d0d10',border:`1px solid ${brC}33`,borderRadius:8,padding:'8px 14px',borderLeft:`3px solid ${brC}`}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:18,fontWeight:800,color:brC}}>{btsL?.last7d?.blogs || 0}/{btsL?.weeklyBlogLimit || 1}</span>
                  <span style={{fontSize:9,color:'#888'}}>blogs this week</span>
                </div>
                <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginTop:4,overflow:'hidden'}}>
                  <div style={{height:4,width:`${Math.min(100,((btsL?.last7d?.blogs||0)/(btsL?.weeklyBlogLimit||1))*100)}%`,background:brC,borderRadius:2}}></div>
                </div>
              </div>
              <div style={{minWidth:100,background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'8px 14px',textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:800,color:brC}}>{btsL?.statusLabel ? (st === 'green' ? '🟢' : st === 'amber' ? '🟡' : '🔴') : '🟢'}</div>
                <div style={{fontSize:8,color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Google Safety</div>
              </div>
            </div>
          )
        })()}

        {/* Blog Pipeline — always visible */}
        <div style={{background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{fontSize:9,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:3}}>
            📝 Blog Pipeline — {blogs?.published || 0} published · {(blogs?.planned || []).filter(b => b.status === 'draft' || b.status === 'in-progress').length || 0} drafts · {(blogs?.planned || []).filter(b => b.status === 'not-started').length || 0} planned
          </div>
          {blogs?.planned?.length > 0 ? (
            <div>
              {blogs.planned.slice(0, 8).map((b, i) => {
                const sColor = b.status === 'published' ? '#10b981' : b.status === 'draft' || b.status === 'in-progress' ? '#f59e0b' : '#555'
                const sLabel = b.status === 'published' ? '✅ LIVE' : b.status === 'draft' ? '📝 DRAFT' : b.status === 'in-progress' ? '🔨 WIP' : '⬜ PLANNED'
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid #111',fontSize:11}}>
                    <span style={{fontSize:9,color:sColor,fontWeight:600,minWidth:70}}>{sLabel}</span>
                    <span style={{color:'#fff',fontWeight:500,flex:1}}>{b.title}</span>
                    <span style={{fontSize:9,color:'#888'}}>{b.service}</span>
                  </div>
                )
              })}
              {blogs.planned.length > 8 && (
                <div style={{fontSize:9,color:'#555',marginTop:4,textAlign:'right'}}>+{blogs.planned.length - 8} more planned</div>
              )}
            </div>
          ) : (
            <div style={{color:'#333',fontSize:11,fontStyle:'italic'}}>No blogs in pipeline yet</div>
          )}
        </div>

        {/* Tab navigation */}
        <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none'}}>
          <TabButton active={tab==='rankings'} label="📊 Rankings" onClick={() => setTab('rankings')} />
          <TabButton active={tab==='matrix'} label="📍 Coverage Matrix" onClick={() => setTab('matrix')} />
          <TabButton active={tab==='framework'} label="📋 Framework" onClick={() => setTab('framework')} />
          <TabButton active={tab==='competitors'} label="🏆 Competitors" onClick={() => setTab('competitors')} />
          <TabButton active={tab==='safety'} label="🛡️ Google Safety" onClick={() => setTab('safety')} />
        </div>

        {/* TAB 1: Rankings */}
        {tab === 'rankings' && (
          <>
            {/* Top 10 Tracked Keywords */}
            {kw?.top10?.length > 0 && (
              <div className="section" style={{marginBottom:16}}>
                <div className="sec-title">🏆 Top 10 Tracked Keywords</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Keyword</th><th>Baseline</th><th>Current</th><th>Trend</th><th>Section</th></tr></thead>
                    <tbody>
                      {kw.top10.map((k, i) => {
                        const improved = k.latest != null && k.baseline != null && k.latest < k.baseline
                        const dropped = k.latest != null && k.baseline != null && k.latest > k.baseline
                        return (
                          <tr key={i}>
                            <td style={{color:'#fff',fontWeight:600}}>{k.keyword}</td>
                            <td>{k.baseline != null ? <PosCell pos={k.baseline} /> : <span style={{color:'#555'}}>—</span>}</td>
                            <td>{k.latest != null ? <PosCell pos={k.latest} /> : <span style={{color:'#555'}}>—</span>}</td>
                            <td style={{fontSize:11}}>
                              {improved ? <span style={{color:'#10b981'}}>📈 ↑{k.baseline - k.latest}</span> :
                               dropped ? <span style={{color:'#ef4444'}}>📉 ↓{k.latest - k.baseline}</span> :
                               <span style={{color:'#999'}}>—</span>}
                            </td>
                            <td style={{fontSize:9,color:'#888'}}>{k.section || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{fontSize:8,color:'#777',marginTop:6,textAlign:'right'}}>
                    Source: bts-keyword-tracker · Updated: {kw?.lastUpdated || '—'}
                  </div>
                </div>
              </div>
            )}

            {/* All Keywords by Section */}
            <div className="section">
              <div className="sec-title">All Tracked Keywords ({totalKeywords})</div>
              <div className="card">
                <table>
                  <thead><tr><th>Keyword</th><th>Baseline</th><th>Current</th><th>Section</th></tr></thead>
                  <tbody>
                    {(kw?.keywords || []).map((k, i) => (
                      <tr key={i}>
                        <td style={{color:'#fff',fontWeight:500}}>{k.keyword}</td>
                        <td>{k.baseline != null ? <PosCell pos={k.baseline} /> : <span style={{color:'#555'}}>—</span>}</td>
                        <td>{k.latest != null ? <PosCell pos={k.latest} /> : <span style={{color:'#555'}}>—</span>}</td>
                        <td style={{fontSize:9,color:'#888'}}>{k.section || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Core Keywords */}
            <div className="grid2">
              <div className="section">
                <div className="sec-title">Core Keywords</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Keyword</th><th>Pos</th></tr></thead>
                    <tbody>
                      {seo?.coreKeywords?.map((k, i) => (
                        <tr key={i}><td>{k.keyword}</td><td><PosCell pos={k.position} /></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="section">
                <div className="sec-title">Location Keywords</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Keyword</th><th>Pos</th></tr></thead>
                    <tbody>
                      {seo?.locationKeywords?.map((k, i) => (
                        <tr key={i}><td>{k.keyword}</td><td><PosCell pos={k.position} /></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Coverage Matrix */}
        {tab === 'matrix' && (
          <>
            <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#10b981'}}>{servicePages}</div>
                <div className="stat-lbl">Location Pages Live</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#3b82f6'}}>{blogCount}</div>
                <div className="stat-lbl">Blog Posts Live</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#f59e0b'}}>{servicePagesNeeded - servicePages}</div>
                <div className="stat-lbl">Locations Remaining</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#a855f7'}}>{seo?.locationCoverage?.summary?.keywordsPerLocation || 0}</div>
                <div className="stat-lbl">Keywords/Location</div>
              </div>
            </div>

            {/* Execution Waves */}
            {seo?.locationCoverage?.waves && (
              <div className="section">
                <div className="sec-title">Execution Waves</div>
                {seo.locationCoverage.waves.map(wave => (
                  <WaveBar key={wave.id} wave={wave} type="locations" />
                ))}
              </div>
            )}

            {/* Location Tiers */}
            {plan?.locations && (
              <div className="section">
                <div className="sec-title">Location Tiers</div>
                {Object.entries({
                  'Tier 1 — Core': plan.locations.tier1,
                  'Tier 2 — Expansion': plan.locations.tier2,
                  'Tier 3 — Wider': plan.locations.tier3,
                  'Tier 4 — Regional': plan.locations.tier4,
                }).map(([label, locs]) => locs?.length > 0 && (
                  <div key={label} style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:'#888',fontWeight:600,marginBottom:4}}>{label}</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {locs.map(l => (
                        <span key={l} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'#1a1a1a',border:'1px solid #222',color:'#aaa'}}>{l}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{fontSize:9,color:'#555',marginTop:4}}>Total locations: {plan.locations.total}</div>
              </div>
            )}

            {/* Content Gaps */}
            {plan?.contentGaps?.length > 0 && (
              <div className="section">
                <div className="sec-title">Priority Content Gaps</div>
                <div className="card">
                  {plan.contentGaps.map((g, i) => (
                    <div key={i} style={{fontSize:11,color:'#aaa',padding:'5px 0',borderBottom:'1px solid #1a1a1a',display:'flex',gap:8}}>
                      <span style={{color:'#ef4444',fontWeight:700,minWidth:16}}>P{g.priority}</span>
                      <span style={{color:'#fff',fontWeight:600,flex:1}}>{g.gap}</span>
                      <span style={{fontSize:9,color:'#999'}}>{g.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Inventory */}
            {blogs && (
              <div className="section">
                <div className="sec-title">Blog Inventory</div>
                <div style={{display:'flex',gap:12,marginBottom:8}}>
                  <div className="stat-card" style={{minWidth:80}}>
                    <div className="stat-val" style={{fontSize:16,color:'#10b981'}}>{blogs.published || 0}</div>
                    <div className="stat-lbl">Published</div>
                  </div>
                  <div className="stat-card" style={{minWidth:80}}>
                    <div className="stat-val" style={{fontSize:16,color:'#f59e0b'}}>{blogs.drafts || 0}</div>
                    <div className="stat-lbl">Drafts</div>
                  </div>
                  <div className="stat-card" style={{minWidth:80}}>
                    <div className="stat-val" style={{fontSize:16,color:'#3b82f6'}}>{blogs.planned?.length || 0}</div>
                    <div className="stat-lbl">Planned</div>
                  </div>
                </div>
                {blogs.planned?.length > 0 && (
                  <div className="card">
                    <table>
                      <thead><tr><th>Title</th><th>Service</th><th>Status</th></tr></thead>
                      <tbody>
                        {blogs.planned.map((b, i) => (
                          <tr key={i}>
                            <td style={{color:'#fff',fontWeight:500}}>{b.title}</td>
                            <td style={{fontSize:9}}>{b.service}</td>
                            <td style={{fontSize:9,color: b.status === 'published' ? '#10b981' : b.status === 'draft' ? '#f59e0b' : '#555'}}>{b.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 3: Framework */}
        {tab === 'framework' && (
          <>
            <div className="section">
              <div className="sec-title">SEO Strategy</div>
              <div className="card">
                <div style={{fontSize:11,color:'#aaa',padding:'4px 0',borderBottom:'1px solid #1a1a1a'}}>
                  <strong style={{color:'#fff'}}>Strategy:</strong> {seo?.framework?.strategy || '—'}
                </div>
                <div style={{fontSize:11,color:'#aaa',padding:'4px 0',borderBottom:'1px solid #1a1a1a'}}>
                  <strong style={{color:'#fff'}}>URL Pattern:</strong> <code style={{color:'#3b82f6',fontSize:10}}>{seo?.framework?.urlStructure || '—'}</code>
                </div>
                <div style={{fontSize:11,color:'#aaa',padding:'4px 0',borderBottom:'1px solid #1a1a1a'}}>
                  <strong style={{color:'#fff'}}>Weekly Cadence:</strong> {seo?.framework?.weeklyCadence || '—'}
                </div>
                <div style={{fontSize:11,color:'#aaa',padding:'4px 0'}}>
                  <strong style={{color:'#fff'}}>Review Coaching:</strong> {seo?.framework?.reviewCoaching ? '✅ Active' : '❌ Off'}
                </div>
              </div>
            </div>
            <div className="section">
              <div className="sec-title">Content Rules</div>
              <div className="card">
                {seo?.framework?.contentRules?.map((rule, i) => (
                  <div key={i} style={{fontSize:11,color:'#aaa',padding:'4px 0',display:'flex',alignItems:'center',gap:6,borderBottom:'1px solid #1a1a1a'}}>
                    <span style={{color:'#10b981'}}>✓</span> {rule}
                  </div>
                ))}
              </div>
            </div>
            <div className="section">
              <div className="sec-title">Planned Content Waves</div>
              <div className="card">
                {plan?.plannedContent && Object.entries(plan.plannedContent).map(([wave, items]) => (
                  <div key={wave} style={{marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:'#fff',marginBottom:4,textTransform:'capitalize'}}>{wave.replace(/([0-9])/g, ' $1')}</div>
                    {items?.map((item, i) => (
                      <div key={i} style={{fontSize:10,color:'#aaa',padding:'2px 0',paddingLeft:12,display:'flex',gap:6}}>
                        <span style={{color:'#3b82f6'}}>•</span> {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="section">
              <div className="sec-title">Assets</div>
              <div className="card" style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#f59e0b'}}>{seo?.assets?.googleReviews || 0}</div>
                  <div style={{fontSize:9,color:'#999'}}>Google Reviews</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#3b82f6'}}>{seo?.assets?.courseCertifications || 0}</div>
                  <div style={{fontSize:9,color:'#999'}}>Certifications</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#10b981'}}>{seo?.assets?.trainingServices || 0}</div>
                  <div style={{fontSize:9,color:'#999'}}>Training Services</div>
                </div>
              </div>
            </div>
            <div className="section">
              <div className="sec-title">Cadence</div>
              <div className="card">
                {plan?.cadence && Object.entries(plan.cadence).map(([k, v]) => (
                  <div key={k} style={{fontSize:11,color:'#aaa',padding:'4px 0',borderBottom:'1px solid #1a1a1a'}}>
                    <strong style={{color:'#fff',textTransform:'capitalize'}}>{k.replace(/([A-Z])/g, ' $1')}:</strong> {v}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 4: Competitors */}
        {tab === 'competitors' && (
          <>
            <div className="section">
              <div className="sec-title">Competitor Watch ({comp?.competitors?.length || 0})</div>
              {(comp?.competitors || []).map((c, i) => {
                const threatColor = c.threat === 'high' ? '#ef4444' : c.threat === 'medium' ? '#f59e0b' : '#10b981'
                return (
                  <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: 12, marginBottom: 8, borderLeft: `3px solid ${threatColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <ThreatDot level={c.threat} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 9, color: '#3b82f6' }}>{c.domain}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: threatColor, background: c.threat === 'high' ? '#3b1010' : c.threat === 'medium' ? '#2a2000' : '#0a2a1a', padding: '2px 6px', borderRadius: 4 }}>
                        {c.threat} THREAT
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>Strengths</div>
                        {c.strengths?.map((s, j) => (
                          <div key={j} style={{ fontSize: 9, color: '#ef4444', padding: '2px 0', display: 'flex', gap: 4 }}>
                            <span>⚠️</span> {s}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>Weaknesses</div>
                        {c.weaknesses?.map((w, j) => (
                          <div key={j} style={{ fontSize: 9, color: '#10b981', padding: '2px 0', display: 'flex', gap: 4 }}>
                            <span>✅</span> {w}
                          </div>
                        ))}
                      </div>
                    </div>

                    {c.locationsRanking?.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 8, color: '#555', fontWeight: 600 }}>RANKING IN: </span>
                        {c.locationsRanking.map(s => (
                          <span key={s} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: '#3b1010', color: '#ef4444', marginRight: 4, fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: 8, color: '#555', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gap Opportunities</div>
                    {c.gapOpportunities?.map((g, j) => (
                      <div key={j} style={{ fontSize: 9, color: '#3b82f6', padding: '2px 0', display: 'flex', gap: 4 }}>
                        <span>🎯</span> {g}
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 8, color: '#444' }}>
                      <span>Pages: {c.contentStrategy?.servicePagesEstimate || '?'}</span>
                      <span>Blogs: {c.contentStrategy?.blogEstimate || '?'}</span>
                      <span>Updates: {c.contentStrategy?.updateFrequency || '?'}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Key Keyword Gaps */}
            <div className="section">
              <div className="sec-title">Keyword Gaps — Where They Beat Us</div>
              <div className="card">
                <table>
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Our Position</th>
                      <th>Top Competitor</th>
                      <th>Their Position</th>
                      <th>Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(comp?.keyGaps || []).map((gap, i) => (
                      <tr key={i}>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{gap.keyword}</td>
                        <td style={{ color: '#ef4444', fontWeight: 700 }}>{gap.ourPosition}</td>
                        <td>{gap.topCompetitor}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>{gap.competitorPosition}</td>
                        <td style={{ fontSize: 9 }}>{gap.opportunity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!comp && (
              <div className="section">
                <div style={{ color: '#555', fontSize: 11, fontStyle: 'italic', padding: 16, textAlign: 'center' }}>
                  Competitor data not loaded yet — will appear on next snapshot refresh
                </div>
              </div>
            )}

            <div style={{ fontSize: 8, color: '#333', marginTop: 8, textAlign: 'right' }}>
              Scan status: {comp?.scanStatus || 'pending'} · Updated: {comp?.updatedAt ? timeAgo(comp.updatedAt) : '—'}
            </div>
          </>
        )}

        {/* TAB 5: Google Safety */}
        {tab === 'safety' && (
          <>
            {(() => {
              const btsLedger = snap?.btsPublishLedger
              const st = btsLedger?.status || 'green'
              const bgC = st === 'red' ? '#3b1010' : st === 'amber' ? '#2a2000' : '#0a2a1a'
              const brC = st === 'red' ? '#ef4444' : st === 'amber' ? '#f59e0b' : '#10b981'
              return (
                <>
                  <div style={{ background: bgC, border: `1px solid ${brC}`, borderRadius: 10, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: brC }}>{btsLedger?.statusLabel || '🟢 No publishes yet'}</div>
                  </div>

                  <div className="grid2" style={{ marginBottom: 16 }}>
                    <div className="card">
                      <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Location Pages — Last 7 Days</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: (btsLedger?.last7d?.pages || 0) >= (btsLedger?.weeklyPageLimit || 3) ? '#ef4444' : '#10b981' }}>
                          {btsLedger?.last7d?.pages || 0}
                        </div>
                        <div style={{ fontSize: 14, color: '#555' }}>/ {btsLedger?.weeklyPageLimit || 3}</div>
                      </div>
                      <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: 8, borderRadius: 4,
                          width: `${Math.min(100, ((btsLedger?.last7d?.pages || 0) / (btsLedger?.weeklyPageLimit || 3)) * 100)}%`,
                          background: (btsLedger?.last7d?.pages || 0) >= (btsLedger?.weeklyPageLimit || 3) ? '#ef4444' : '#10b981',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                      <div style={{ fontSize: 9, color: '#555', marginTop: 4 }}>{btsLedger?.pagesRemaining || btsLedger?.weeklyPageLimit || 3} slots remaining</div>
                    </div>

                    <div className="card">
                      <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Blog Posts — Last 7 Days</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: (btsLedger?.last7d?.blogs || 0) > (btsLedger?.weeklyBlogLimit || 1) ? '#ef4444' : '#10b981' }}>
                          {btsLedger?.last7d?.blogs || 0}
                        </div>
                        <div style={{ fontSize: 14, color: '#555' }}>/ {btsLedger?.weeklyBlogLimit || 1}</div>
                      </div>
                      <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: 8, borderRadius: 4,
                          width: `${Math.min(100, ((btsLedger?.last7d?.blogs || 0) / (btsLedger?.weeklyBlogLimit || 1)) * 100)}%`,
                          background: (btsLedger?.last7d?.blogs || 0) > (btsLedger?.weeklyBlogLimit || 1) ? '#ef4444' : '#10b981',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid2" style={{ marginBottom: 16 }}>
                    <div className="stat-card">
                      <div className="stat-val" style={{ fontSize: 20, color: '#3b82f6' }}>{btsLedger?.last30d?.pages || 0}</div>
                      <div className="stat-lbl">Location Pages (30d)</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-val" style={{ fontSize: 20, color: '#a855f7' }}>{btsLedger?.last30d?.blogs || 0}</div>
                      <div className="stat-lbl">Blog Posts (30d)</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-val" style={{ fontSize: 20, color: '#f59e0b' }}>{btsLedger?.totalPages || 0}</div>
                      <div className="stat-lbl">Total Location Pages</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-val" style={{ fontSize: 20, color: '#10b981' }}>{btsLedger?.totalBlogs || 0}</div>
                      <div className="stat-lbl">Total Blog Posts</div>
                    </div>
                  </div>

                  {btsLedger?.entries?.length > 0 && (
                    <div className="section">
                      <div className="sec-title">Publish Timeline</div>
                      <div className="card">
                        <table>
                          <thead><tr><th>First Published</th><th>Type</th><th>Page</th></tr></thead>
                          <tbody>
                            {btsLedger.entries.slice().sort((a, b) => new Date(b.firstPublished) - new Date(a.firstPublished)).map((e, i) => {
                              const d = new Date(e.firstPublished)
                              const dateStr = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear()
                              const isRecent = (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
                              return (
                                <tr key={i}>
                                  <td style={{ color: isRecent ? '#f59e0b' : '#fff', fontWeight: 600 }}>{dateStr}{isRecent ? ' 🔥' : ''}</td>
                                  <td style={{ color: e.type === 'location' ? '#3b82f6' : '#a855f7' }}>{e.type}</td>
                                  <td>{e.title || e.slug}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📄 Publish Limits</div>
                    <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                      <span style={{color:'#fff',fontWeight:600}}>Max location pages/week:</span> {btsLedger?.weeklyPageLimit || 3}
                    </div>
                    <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                      <span style={{color:'#fff',fontWeight:600}}>Max blog posts/week:</span> {btsLedger?.weeklyBlogLimit || 1}
                    </div>
                    <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0' }}>
                      <span style={{color:'#fff',fontWeight:600}}>Tracked by:</span> Command Centre ledger (timestamped)
                    </div>
                  </div>
                </>
              )
            })()}
          </>
        )}

        {/* Today's Wins — always visible */}
        {seo?.todayWins?.length > 0 && (
          <div className="section" style={{marginTop:20}}>
            <div className="sec-title">Today&apos;s Wins</div>
            <div className="card">
              {seo.todayWins.map((w, i) => (
                <div className="win" key={i}>
                  <span style={{color:'#10b981'}}>✅</span> {w}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
