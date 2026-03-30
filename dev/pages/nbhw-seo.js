import Head from 'next/head'
import { useState, useEffect } from 'react'
import SeoDashboard from './components/seo-dashboard'
import GbpPosts from './components/gbp-posts'

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

function WaveBar({ wave }) {
  const colors = { active: '#ef4444', planned: '#f59e0b', future: '#333' }
  const spPct = wave.servicePagesTotal > 0 ? Math.round((wave.servicePages / wave.servicePagesTotal) * 100) : 0
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
      {/* Progress bar */}
      <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginBottom:4,overflow:'hidden'}}>
        <div style={{height:4,width:`${spPct}%`,background:colors[wave.status] || '#333',borderRadius:2,minWidth: spPct > 0 ? 4 : 0}}></div>
      </div>
      {wave.suburbs.length > 0 && (
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:4}}>
          {wave.suburbs.map(s => (
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

export default function NbhwSeoPage() {
  const snap = useSnapshot()
  const seo = snap?.nbhwSeo
  const comp = snap?.nbhwCompetitors
  const pub = snap?.nbhwPublishLog
  const ledger = snap?.nbhwPublishLedger
  const live = snap?.nbhwLive
  const kw = snap?.nbhwKeywords
  const audit = snap?.nbhwSeoAudit
  const traffic = snap?.nbhwTraffic
  const seoDash = snap?.nbhwSeoDash
  const [tab, setTab] = useState(seoDash ? 'seo-plan' : 'health')

  const coreAt1 = seo?.coreKeywords?.filter(k => k.position === 1).length || 0
  const coreTotal = seo?.coreKeywords?.length || 0
  const suburbRanking = seo?.suburbKeywords?.filter(k => k.position <= 10).length || 0
  const suburbTotal = seo?.suburbKeywords?.length || 0
  // Use live detection data when available, fall back to static JSON
  const totalServicePages = live?.totalSuburbPages || seo?.suburbCoverage?.waves?.reduce((a, w) => a + (w.servicePages || 0), 0) || 0
  const totalServicePagesNeeded = seo?.suburbCoverage?.waves?.reduce((a, w) => a + (w.servicePagesTotal || 0), 0) || 0
  const totalBlogs = live?.totalBlogPages || seo?.suburbCoverage?.waves?.reduce((a, w) => a + (w.blogs || 0), 0) || 0

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NBHW SEO — Command Centre</title>
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
          <h1>🔧 NBHW — SEO Command</h1>
          <span className="meta">Updated: {seo ? timeAgo(seo.lastUpdated) : '—'}</span>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-val" style={{color:'#10b981'}}>{coreAt1}/{coreTotal}</div>
            <div className="stat-lbl">Core Keywords at #1</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ef4444'}}>{suburbRanking}/{suburbTotal}</div>
            <div className="stat-lbl">Suburb Keywords in Top 10</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#10b981'}}>{live?.totalSuburbPages || seo?.suburbCoverage?.summary?.servicePages || 0}</div>
            <div className="stat-lbl">Suburb Pages Live</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#3b82f6'}}>{live?.totalBlogPages || seo?.suburbCoverage?.summary?.withBlogCoverage || 0}</div>
            <div className="stat-lbl">Blog Posts Live</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ef4444'}}>{totalServicePagesNeeded - totalServicePages}</div>
            <div className="stat-lbl">Suburbs Remaining</div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none'}}>
          <TabButton active={tab==='health'} label="🏥 SEO Health" onClick={() => setTab('health')} />
          <TabButton active={tab==='seo-plan'} label="📋 SEO Plan" onClick={() => setTab('seo-plan')} />
          <TabButton active={tab==='rankings'} label="📊 Rankings" onClick={() => setTab('rankings')} />
          <TabButton active={tab==='matrix'} label="📍 Coverage Matrix" onClick={() => setTab('matrix')} />
          <TabButton active={tab==='competitors'} label="🏆 Competitors" onClick={() => setTab('competitors')} />
          <TabButton active={tab==='safety'} label={`🛡️ Google Safety${ledger?.status === 'red' ? ' 🔴' : ledger?.status === 'amber' ? ' 🟡' : ''}`} onClick={() => setTab('safety')} />
          <TabButton active={tab==='news-bank'} label="📰 News Bank" onClick={() => setTab('news-bank')} />
          <TabButton active={tab==='suggestions'} label="💡 Suggestions" onClick={() => setTab('suggestions')} />
          <TabButton active={tab==='gbp-posts'} label="📍 GBP Posts" onClick={() => setTab('gbp-posts')} />
          <TabButton active={tab==='future-posts'} label="📮 Future Posts" onClick={() => setTab('future-posts')} />
          <TabButton active={tab==='traffic'} label="📊 Traffic" onClick={() => setTab('traffic')} />
          <TabButton active={tab==='conversions'} label="📞 Conversions" onClick={() => setTab('conversions')} />
        </div>

        {/* TAB: SEO Plan (standardised format) */}
        {tab === 'seo-plan' && (
          <SeoDashboard seoDash={seoDash} publishLedger={snap?.nbhwPublishLedger} label="NBHW" />
        )}

        {/* TAB: Site Health */}
        {tab === 'health' && (
          <>
            {/* Hero Gauges */}
            <div className="grid2" style={{marginBottom:16}}>
              {/* SEO Health Score */}
              <div className="card" style={{textAlign:'center',padding:20}}>
                <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>SEO Health Score</div>
                {(() => {
                  const score = audit?.healthScore
                  const hasData = score != null
                  const color = !hasData ? '#333' : score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
                  const circumference = 2 * Math.PI * 54
                  const offset = hasData ? circumference - (score / 100) * circumference : circumference
                  return (
                    <>
                      <div style={{position:'relative',width:130,height:130,margin:'0 auto'}}>
                        <svg width="130" height="130" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a22" strokeWidth="8" />
                          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" transform="rotate(-90 60 60)"
                            style={{transition:'stroke-dashoffset 1s ease'}} />
                        </svg>
                        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
                          <div style={{fontSize:32,fontWeight:800,color}}>{hasData ? score : '—'}</div>
                          <div style={{fontSize:8,color:'#888',letterSpacing:1}}>/ 100</div>
                        </div>
                      </div>
                      {/* Category breakdown bars */}
                      <div style={{marginTop:14,textAlign:'left'}}>
                        {['technical','content','onPage','schema','performance','aiSearch','images'].map(cat => {
                          const val = audit?.healthBreakdown?.[cat]
                          const label = cat === 'onPage' ? 'On-Page' : cat === 'aiSearch' ? 'AI Search' : cat.charAt(0).toUpperCase() + cat.slice(1)
                          const c = val == null ? '#333' : val >= 80 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444'
                          return (
                            <div key={cat} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                              <span style={{fontSize:9,color:'#999',minWidth:70,textAlign:'right'}}>{label}</span>
                              <div style={{flex:1,height:6,background:'#1a1a1a',borderRadius:3,overflow:'hidden'}}>
                                <div style={{height:6,width:val != null ? `${val}%` : '0%',background:c,borderRadius:3,transition:'width 0.5s'}}></div>
                              </div>
                              <span style={{fontSize:9,color:c,fontWeight:700,minWidth:28}}>{val != null ? val : '—'}</span>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* GEO Readiness Score */}
              <div className="card" style={{textAlign:'center',padding:20}}>
                <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>GEO Readiness — AI Search</div>
                {(() => {
                  const score = audit?.geoScore
                  const hasData = score != null
                  const color = !hasData ? '#333' : score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
                  const circumference = 2 * Math.PI * 54
                  const offset = hasData ? circumference - (score / 100) * circumference : circumference
                  return (
                    <>
                      <div style={{position:'relative',width:130,height:130,margin:'0 auto'}}>
                        <svg width="130" height="130" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a22" strokeWidth="8" />
                          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" transform="rotate(-90 60 60)"
                            style={{transition:'stroke-dashoffset 1s ease'}} />
                        </svg>
                        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
                          <div style={{fontSize:32,fontWeight:800,color}}>{hasData ? score : '—'}</div>
                          <div style={{fontSize:8,color:'#888',letterSpacing:1}}>/ 100</div>
                        </div>
                      </div>
                      {/* Pillar breakdown bars */}
                      <div style={{marginTop:14,textAlign:'left'}}>
                        {['citability','structure','multiModal','authority','technicalAccess'].map(pillar => {
                          const val = audit?.geoBreakdown?.[pillar]
                          const label = pillar === 'multiModal' ? 'Multi-Modal' : pillar === 'technicalAccess' ? 'Tech Access' : pillar.charAt(0).toUpperCase() + pillar.slice(1)
                          const c = val == null ? '#333' : val >= 70 ? '#10b981' : val >= 40 ? '#f59e0b' : '#ef4444'
                          return (
                            <div key={pillar} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                              <span style={{fontSize:9,color:'#999',minWidth:70,textAlign:'right'}}>{label}</span>
                              <div style={{flex:1,height:6,background:'#1a1a1a',borderRadius:3,overflow:'hidden'}}>
                                <div style={{height:6,width:val != null ? `${val}%` : '0%',background:c,borderRadius:3,transition:'width 0.5s'}}></div>
                              </div>
                              <span style={{fontSize:9,color:c,fontWeight:700,minWidth:28}}>{val != null ? val : '—'}</span>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* AI Crawler Status */}
            <div className="section">
              <div className="sec-title">🤖 AI Crawler Access</div>
              <div className="card">
                {audit?.crawlers?.length > 0 ? (
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {audit.crawlers.map((c, i) => {
                      const canAccess = c.allowed && c.canRead !== false
                      const blocked = !c.allowed
                      const allowed_no_read = c.allowed && c.canRead === false
                      const bg = blocked ? '#3b1010' : allowed_no_read ? '#2a2000' : '#0a2a1a'
                      const clr = blocked ? '#ef4444' : allowed_no_read ? '#f59e0b' : '#10b981'
                      const icon = blocked ? '❌' : allowed_no_read ? '⚠️' : '✅'
                      return (
                        <div key={i} style={{fontSize:10,padding:'4px 10px',borderRadius:6,fontWeight:600,background:bg,color:clr,border:`1px solid ${clr}`}}>
                          {icon} {c.name}
                          {allowed_no_read && <div style={{fontSize:8,color:'#f59e0b',fontWeight:400,marginTop:1}}>Allowed but can't read (JS)</div>}
                          {c.note && canAccess && <div style={{fontSize:8,color:'#888',fontWeight:400,marginTop:1}}>{c.note}</div>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{color:'#555',fontSize:11,fontStyle:'italic',textAlign:'center',padding:8}}>
                    Awaiting audit results…
                  </div>
                )}
              </div>
            </div>

            {/* Action Plan + Schema Status */}
            <div className="grid2" style={{marginBottom:16}}>
              {/* Action Plan */}
              <div className="card">
                <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>📋 Action Plan</div>
                {audit?.actions?.length > 0 ? (
                  <>
                    {['critical','high','medium','low'].map(sev => {
                      const items = audit.actions.filter(a => a.severity === sev)
                      if (items.length === 0) return null
                      const sevColor = sev === 'critical' ? '#ef4444' : sev === 'high' ? '#f59e0b' : sev === 'medium' ? '#3b82f6' : '#888'
                      const sevIcon = sev === 'critical' ? '🔴' : sev === 'high' ? '🟠' : sev === 'medium' ? '🟡' : '⚪'
                      return (
                        <div key={sev} style={{marginBottom:8}}>
                          <div style={{fontSize:9,color:sevColor,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>
                            {sevIcon} {sev} ({items.length})
                          </div>
                          {items.map((item, i) => (
                            <div key={i} style={{fontSize:10,color:'#aaa',padding:'3px 0',borderBottom:'1px solid #1a1a1a',display:'flex',gap:6}}>
                              <span style={{flex:1}}>{item.title}</span>
                              {item.page && <span style={{fontSize:8,color:'#555',fontFamily:'monospace'}}>{item.page}</span>}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <div style={{color:'#555',fontSize:11,fontStyle:'italic',textAlign:'center',padding:16}}>
                    Awaiting audit results…
                  </div>
                )}
              </div>

              {/* Schema Status */}
              <div className="card">
                <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>
                  🏗️ Schema Markup
                  {(audit?.schema?.implemented?.length > 0 || audit?.schema?.missing?.length > 0) && (
                    <span style={{fontSize:9,color:'#888',fontWeight:400,marginLeft:8}}>
                      {audit.schema.implemented.length}/{audit.schema.implemented.length + audit.schema.missing.length} implemented
                    </span>
                  )}
                </div>
                {(audit?.schema?.implemented?.length > 0 || audit?.schema?.missing?.length > 0) ? (
                  <>
                    {audit.schema.implemented.map((s, i) => (
                      <div key={`i-${i}`} style={{fontSize:10,color:'#10b981',padding:'3px 0',borderBottom:'1px solid #1a1a1a'}}>
                        ✅ {s}
                      </div>
                    ))}
                    {audit.schema.missing.map((s, i) => (
                      <div key={`m-${i}`} style={{fontSize:10,color:'#ef4444',padding:'3px 0',borderBottom:'1px solid #1a1a1a'}}>
                        ❌ {s}
                      </div>
                    ))}
                    {audit.schema.deprecated?.map((s, i) => (
                      <div key={`d-${i}`} style={{fontSize:10,color:'#f59e0b',padding:'3px 0',borderBottom:'1px solid #1a1a1a'}}>
                        ⚠️ {s} (deprecated)
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{color:'#555',fontSize:11,fontStyle:'italic',textAlign:'center',padding:16}}>
                    Awaiting audit results…
                  </div>
                )}
              </div>
            </div>

            {/* Score Trend */}
            <div className="section">
              <div className="sec-title">📈 Score Trend</div>
              <div className="card" style={{textAlign:'center',padding:20}}>
                {audit?.history?.length > 1 ? (
                  <div style={{display:'flex',alignItems:'flex-end',gap:3,justifyContent:'center',height:80}}>
                    {audit.history.map((h, i) => {
                      const barH = Math.max(4, (h.healthScore / 100) * 70)
                      const c = h.healthScore >= 80 ? '#10b981' : h.healthScore >= 50 ? '#f59e0b' : '#ef4444'
                      return (
                        <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                          <div style={{width:12,height:barH,background:c,borderRadius:2}}></div>
                          <span style={{fontSize:7,color:'#555'}}>{new Date(h.timestamp).getDate()}/{new Date(h.timestamp).getMonth()+1}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{color:'#333',fontSize:11}}>
                    <div style={{fontSize:24,marginBottom:8}}>📊</div>
                    Trend data collecting… scores will appear here as audits run
                  </div>
                )}
              </div>
            </div>

            {/* Page Traffic */}
            <div className="section">
              <div className="sec-title">📊 Page Traffic — {traffic?.period || 'Last 30 Days'}</div>
              {traffic?.totals?.views != null ? (
                <>
                  {/* KPI row */}
                  <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                    <div className="stat-card" style={{minWidth:90,flex:1}}>
                      <div className="stat-val" style={{fontSize:20,color:'#3b82f6'}}>{traffic.totals.views?.toLocaleString()}</div>
                      <div className="stat-lbl">Page Views</div>
                    </div>
                    <div className="stat-card" style={{minWidth:90,flex:1}}>
                      <div className="stat-val" style={{fontSize:20,color:'#a855f7'}}>{traffic.totals.visitors?.toLocaleString()}</div>
                      <div className="stat-lbl">Unique Visitors</div>
                    </div>
                    <div className="stat-card" style={{minWidth:90,flex:1}}>
                      <div className="stat-val" style={{fontSize:20,color:'#10b981'}}>{traffic.totals.phoneTaps || 0}</div>
                      <div className="stat-lbl">📞 Phone Taps</div>
                    </div>
                    <div className="stat-card" style={{minWidth:90,flex:1}}>
                      <div className="stat-val" style={{fontSize:20,color:'#f59e0b'}}>{traffic.totals.emailTaps || 0}</div>
                      <div className="stat-lbl">✉️ Email Taps</div>
                    </div>
                    <div className="stat-card" style={{minWidth:90,flex:1}}>
                      <div className="stat-val" style={{fontSize:20,color: (traffic.totals.conversionRate || 0) >= 3 ? '#10b981' : (traffic.totals.conversionRate || 0) >= 1 ? '#f59e0b' : '#ef4444'}}>
                        {traffic.totals.conversionRate?.toFixed(1) || '0'}%
                      </div>
                      <div className="stat-lbl">Conversion Rate</div>
                    </div>
                  </div>

                  {/* Top Pages table */}
                  {traffic.pages?.length > 0 && (
                    <div className="card" style={{marginBottom:12}}>
                      <table>
                        <thead>
                          <tr>
                            <th>Page</th>
                            <th>Type</th>
                            <th>Views</th>
                            <th>📞</th>
                            <th>✉️</th>
                            <th>Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {traffic.pages.slice(0, 15).map((p, i) => {
                            const maxViews = traffic.pages[0]?.views || 1
                            const barPct = Math.round((p.views / maxViews) * 100)
                            const typeColor = p.type === 'suburb' ? '#3b82f6' : p.type === 'blog' ? '#a855f7' : p.type === 'service' ? '#f59e0b' : '#888'
                            const trendIcon = p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '→'
                            const trendColor = p.trend === 'up' ? '#10b981' : p.trend === 'down' ? '#ef4444' : '#888'
                            return (
                              <tr key={i}>
                                <td style={{color:'#fff',fontWeight:500,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                  {p.path}
                                  <div style={{height:3,background:'#1a1a1a',borderRadius:2,marginTop:2,overflow:'hidden'}}>
                                    <div style={{height:3,width:`${barPct}%`,background:typeColor,borderRadius:2}}></div>
                                  </div>
                                </td>
                                <td><span style={{fontSize:8,color:typeColor,fontWeight:600,textTransform:'uppercase',background:`${typeColor}15`,padding:'2px 5px',borderRadius:3}}>{p.type}</span></td>
                                <td style={{fontWeight:700}}>{p.views?.toLocaleString()}</td>
                                <td style={{color:p.phoneTaps > 0 ? '#10b981' : '#333'}}>{p.phoneTaps || 0}</td>
                                <td style={{color:p.emailTaps > 0 ? '#f59e0b' : '#333'}}>{p.emailTaps || 0}</td>
                                <td style={{color:trendColor}}>{trendIcon}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {traffic.pages.length > 15 && (
                        <div style={{fontSize:9,color:'#555',marginTop:4,textAlign:'right'}}>+{traffic.pages.length - 15} more pages</div>
                      )}
                    </div>
                  )}

                  {/* Monthly trend bars */}
                  {Object.keys(traffic.monthly || {}).length > 0 && (
                    <div className="card">
                      <div style={{fontSize:9,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Monthly Trend</div>
                      <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
                        {Object.entries(traffic.monthly).sort(([a],[b]) => a.localeCompare(b)).map(([month, data]) => {
                          const maxV = Math.max(...Object.values(traffic.monthly).map(m => m.views || 0), 1)
                          const barH = Math.max(4, ((data.views || 0) / maxV) * 65)
                          return (
                            <div key={month} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                              <span style={{fontSize:8,color:'#888'}}>{data.views?.toLocaleString()}</span>
                              <div style={{width:'100%',maxWidth:40,height:barH,background:'#3b82f6',borderRadius:3}}></div>
                              <div style={{width:'100%',maxWidth:40,height:Math.max(2,((data.contacts||0)/Math.max(...Object.values(traffic.monthly).map(m=>m.contacts||0),1))*20),background:'#10b981',borderRadius:2,marginTop:1}}></div>
                              <span style={{fontSize:7,color:'#555'}}>{month.split('-')[1]}/{month.split('-')[0].slice(2)}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:6}}>
                        <span style={{fontSize:8,color:'#3b82f6'}}>■ Views</span>
                        <span style={{fontSize:8,color:'#10b981'}}>■ Contacts</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card" style={{textAlign:'center',padding:20}}>
                  <div style={{fontSize:20,marginBottom:6}}>📊</div>
                  <div style={{color:'#555',fontSize:11}}>Awaiting GA4 data…</div>
                  <div style={{color:'#333',fontSize:9,marginTop:4}}>Property: {traffic?.gaPropertyId || 'G-LQBTD620CQ'} · API credentials needed from Bitwarden</div>
                </div>
              )}
            </div>

            {/* Conversion Funnel */}
            <div className="section">
              <div className="sec-title">📞 Conversion Funnel</div>
              {traffic?.totals?.views != null ? (
                <div className="card" style={{padding:20}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,flexWrap:'wrap'}}>
                    {/* Visitors */}
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:28,fontWeight:800,color:'#a855f7'}}>{traffic.totals.visitors?.toLocaleString()}</div>
                      <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Visitors</div>
                    </div>
                    <div style={{fontSize:18,color:'#333',padding:'0 4px'}}>→</div>
                    {/* Page Views */}
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:28,fontWeight:800,color:'#3b82f6'}}>{traffic.totals.views?.toLocaleString()}</div>
                      <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Page Views</div>
                    </div>
                    <div style={{fontSize:18,color:'#333',padding:'0 4px'}}>→</div>
                    {/* Contact Clicks */}
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:28,fontWeight:800,color:'#10b981'}}>{(traffic.totals.phoneTaps || 0) + (traffic.totals.emailTaps || 0)}</div>
                      <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Contact Clicks</div>
                    </div>
                  </div>
                  {/* Funnel bar */}
                  <div style={{marginTop:16,position:'relative',height:24}}>
                    <div style={{position:'absolute',left:0,right:0,height:24,background:'#a855f720',borderRadius:12}}></div>
                    <div style={{position:'absolute',left:'10%',right:'10%',height:24,background:'#3b82f630',borderRadius:12}}></div>
                    <div style={{position:'absolute',left:'30%',right:'30%',height:24,background:'#10b98140',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:10,fontWeight:700,color:'#10b981'}}>{traffic.totals.conversionRate?.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:9,color:'#555'}}>
                    <span>📞 {traffic.totals.phoneTaps || 0} phone</span>
                    <span>✉️ {traffic.totals.emailTaps || 0} email</span>
                  </div>
                </div>
              ) : (
                <div className="card" style={{textAlign:'center',padding:20}}>
                  <div style={{fontSize:20,marginBottom:6}}>📞</div>
                  <div style={{color:'#555',fontSize:11}}>Conversion tracking awaiting click event data…</div>
                  <div style={{color:'#333',fontSize:9,marginTop:4}}>NBHW agent needs to add tel/mailto click tracking JS</div>
                </div>
              )}
            </div>

            {/* Data source notice */}
            {audit?.source === 'placeholder' && (
              <div style={{textAlign:'center',padding:12,background:'#111',border:'1px solid #222',borderRadius:8,marginTop:8}}>
                <span style={{fontSize:10,color:'#f59e0b'}}>⏳ Awaiting NBHW SEO audit results — panels will populate automatically when data lands</span>
              </div>
            )}
          </>
        )}

        {/* TAB 1: Rankings */}
        {tab === 'rankings' && (
          <>
            {/* Top 10 Tracked Keywords */}
            {kw?.top10?.length > 0 && (
              <div className="section" style={{marginBottom:16}}>
                <div className="sec-title">🏆 Top 10 Tracked Keywords</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Keyword</th><th>Baseline</th><th>Current</th><th>Trend</th><th>URL</th></tr></thead>
                    <tbody>
                      {kw.top10.map((k, i) => {
                        const improved = k.latest < k.baseline
                        const dropped = k.latest > k.baseline
                        return (
                          <tr key={i}>
                            <td style={{color:'#fff',fontWeight:600}}>{k.keyword}</td>
                            <td><PosCell pos={k.baseline} /></td>
                            <td><PosCell pos={k.latest} /></td>
                            <td style={{fontSize:11}}>
                              {improved ? <span style={{color:'#10b981'}}>📈 ↑{k.baseline - k.latest}</span> :
                               dropped ? <span style={{color:'#ef4444'}}>📉 ↓{k.latest - k.baseline}</span> :
                               <span style={{color:'#999'}}>—</span>}
                            </td>
                            <td style={{fontSize:9,color:'#3b82f6'}}>{k.url || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{fontSize:8,color:'#777',marginTop:6,textAlign:'right'}}>
                    Source: keyword-tracker.md · Updated: {kw.lastUpdated || '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Active Campaigns */}
            {kw?.campaigns?.length > 0 && (
              <div className="section" style={{marginBottom:16}}>
                <div className="sec-title">Active Campaigns</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {kw.campaigns.map((c, i) => (
                    <div key={i} className="card" style={{flex:'1 1 250px'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:4}}>{c.name}</div>
                      <div style={{fontSize:9,color:'#999',marginBottom:4}}>Started: {c.started} · Goal: {c.goal}</div>
                      <div style={{fontSize:10}}>{c.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid2">
              <div className="section">
                <div className="sec-title">Core Keywords — Defending #1</div>
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
                <div className="sec-title">Suburb Keywords — Gap</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Keyword</th><th>Pos</th></tr></thead>
                    <tbody>
                      {seo?.suburbKeywords?.map((k, i) => (
                        <tr key={i}><td>{k.keyword}</td><td><PosCell pos={k.position} /></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="section">
              <div className="sec-title">Competitors</div>
              <div className="card">
                <table>
                  <thead><tr><th>Competitor</th><th>Position</th><th>Threat</th></tr></thead>
                  <tbody>
                    {seo?.competitors?.map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td>{c.position}</td>
                        <td><ThreatDot level={c.threat} /> {c.threat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Coverage Matrix */}
        {tab === 'matrix' && (
          <>
            <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#10b981'}}>{totalServicePages}</div>
                <div className="stat-lbl">Suburb Pages Live</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#3b82f6'}}>{totalBlogs}</div>
                <div className="stat-lbl">Blog Posts Live</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#f59e0b'}}>{totalServicePagesNeeded - totalServicePages}</div>
                <div className="stat-lbl">Suburbs Remaining</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#a855f7'}}>{seo?.suburbCoverage?.summary?.keywordsPerSuburb || 0}</div>
                <div className="stat-lbl">Keywords/Suburb</div>
              </div>
            </div>

            {/* Live-detected wave status */}
            {live?.waveStatus && (
              <div className="section">
                <div className="sec-title">Execution Waves — Live Detection</div>
                {Object.entries(live.waveStatus).map(([num, ws]) => {
                  const color = ws.complete ? '#10b981' : ws.live > 0 ? '#f59e0b' : '#333'
                  const label = ws.complete ? '✅ COMPLETE' : ws.live > 0 ? '🟡 IN PROGRESS' : '⬜ NOT STARTED'
                  return (
                    <div key={num} style={{background:'#111',border:'1px solid #222',borderRadius:8,padding:10,marginBottom:6,borderLeft:`3px solid ${color}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600,color:'#fff'}}>Wave {num}</span>
                        <span style={{fontSize:9,color:color,fontWeight:600}}>{label}</span>
                        <span style={{fontSize:9,color:'#999',marginLeft:'auto'}}>{ws.live}/{ws.total} suburbs live</span>
                      </div>
                      <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginBottom:6,overflow:'hidden'}}>
                        <div style={{height:4,width:`${ws.pct}%`,background:color,borderRadius:2,minWidth:ws.live > 0 ? 4 : 0,transition:'width 0.3s'}}></div>
                      </div>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        {ws.liveSuburbs?.map(s => (
                          <span key={s} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'#0a2a1a',border:'1px solid #10b981',color:'#10b981'}}>
                            ✅ {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
                        {ws.remaining?.map(s => (
                          <span key={s} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'#1a1a1a',border:'1px solid #333',color:'#999'}}>
                            ⬜ {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <div style={{fontSize:8,color:'#777',marginTop:4}}>Auto-detected from file system · {live.lastDetected ? `Scanned: ${new Date(live.lastDetected).toLocaleTimeString()}` : ''}</div>
              </div>
            )}

            {/* Live suburb pages */}
            {live?.liveSuburbs?.length > 0 && (
              <div className="section">
                <div className="sec-title">Live Suburb Pages ({live.totalSuburbPages})</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Suburb</th><th>URL</th><th>Built</th></tr></thead>
                    <tbody>
                      {live.liveSuburbs.map((s, i) => (
                        <tr key={i}>
                          <td style={{color:'#10b981',fontWeight:600}}>✅ {s.name}</td>
                          <td style={{fontSize:9}}><a href={`https://northernbeacheshotwater.com.au/hot-water/${s.slug}`} target="_blank" rel="noopener">/hot-water/{s.slug}</a></td>
                          <td style={{fontSize:9,color:'#999'}}>{s.builtAt ? new Date(s.builtAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Git publish history */}
            {live?.publishHistory?.length > 0 && (
              <div className="section">
                <div className="sec-title">Git Publish History</div>
                <div className="card">
                  {live.publishHistory.map((h, i) => (
                    <div key={i} style={{fontSize:10,color:'#aaa',padding:'4px 0',borderBottom:'1px solid #1a1a1a',display:'flex',gap:8}}>
                      <span style={{color:'#999',fontFamily:'monospace',fontSize:9,minWidth:50}}>{h.hash}</span>
                      <span style={{color:'#3b82f6',minWidth:85}}>{h.date ? new Date(h.date).toLocaleDateString() : '—'}</span>
                      <span>{h.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback to static waves if no live data */}
            {!live?.waveStatus && seo?.suburbCoverage?.waves && (
              <div className="section">
                <div className="sec-title">Execution Waves (Static — ⚠️ may be stale)</div>
                {seo.suburbCoverage.waves.map(wave => (
                  <WaveBar key={wave.id} wave={wave} />
                ))}
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
              <div className="sec-title">Assets</div>
              <div className="card" style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#f59e0b'}}>{seo?.assets?.googleReviews || 0}</div>
                  <div style={{fontSize:9,color:'#999'}}>Google Reviews</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#3b82f6'}}>{seo?.assets?.unusedPhotos || 0}</div>
                  <div style={{fontSize:9,color:'#999'}}>Unused Photos</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#10b981'}}>{seo?.assets?.photoCategories || 0}</div>
                  <div style={{fontSize:9,color:'#999'}}>Photo Categories</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 4: Competitors */}
        {tab === 'competitors' && (
          <>
            {/* Competitor Cards */}
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

                    {c.suburbsRanking?.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 8, color: '#555', fontWeight: 600 }}>RANKING IN: </span>
                        {c.suburbsRanking.map(s => (
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

        {/* TAB 5: Google Safety Meter (Ledger-driven) */}
        {tab === 'safety' && (
          <>
            {/* Status Banner */}
            {(() => {
              const st = ledger?.status || 'green'
              const bgC = st === 'red' ? '#3b1010' : st === 'amber' ? '#2a2000' : '#0a2a1a'
              const brC = st === 'red' ? '#ef4444' : st === 'amber' ? '#f59e0b' : '#10b981'
              return (
                <div style={{ background: bgC, border: `1px solid ${brC}`, borderRadius: 10, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: brC }}>{ledger?.statusLabel || '⏳ Loading...'}</div>
                </div>
              )
            })()}

            {/* Gauges */}
            <div className="grid2" style={{ marginBottom: 16 }}>
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Suburb Pages — Last 7 Days</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: (ledger?.last7d?.pages || 0) >= (ledger?.weeklyPageLimit || 3) ? '#ef4444' : '#10b981' }}>
                    {ledger?.last7d?.pages || 0}
                  </div>
                  <div style={{ fontSize: 14, color: '#555' }}>/ {ledger?.weeklyPageLimit || 3}</div>
                </div>
                <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: 8, borderRadius: 4,
                    width: `${Math.min(100, ((ledger?.last7d?.pages || 0) / (ledger?.weeklyPageLimit || 3)) * 100)}%`,
                    background: (ledger?.last7d?.pages || 0) >= (ledger?.weeklyPageLimit || 3) ? '#ef4444' : '#10b981',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                <div style={{ fontSize: 9, color: '#555', marginTop: 4 }}>{ledger?.pagesRemaining || 0} slots remaining</div>
              </div>

              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Blog Posts — Last 7 Days</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: (ledger?.last7d?.blogs || 0) > (ledger?.weeklyBlogLimit || 1) ? '#ef4444' : '#10b981' }}>
                    {ledger?.last7d?.blogs || 0}
                  </div>
                  <div style={{ fontSize: 14, color: '#555' }}>/ {ledger?.weeklyBlogLimit || 1}</div>
                </div>
                <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: 8, borderRadius: 4,
                    width: `${Math.min(100, ((ledger?.last7d?.blogs || 0) / (ledger?.weeklyBlogLimit || 1)) * 100)}%`,
                    background: (ledger?.last7d?.blogs || 0) > (ledger?.weeklyBlogLimit || 1) ? '#ef4444' : '#10b981',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
            </div>

            {/* 30-day summary */}
            <div className="grid2" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-val" style={{ fontSize: 20, color: '#3b82f6' }}>{ledger?.last30d?.pages || 0}</div>
                <div className="stat-lbl">Suburb Pages (30d)</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ fontSize: 20, color: '#a855f7' }}>{ledger?.last30d?.blogs || 0}</div>
                <div className="stat-lbl">Blog Posts (30d)</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ fontSize: 20, color: '#f59e0b' }}>{ledger?.totalPages || 0}</div>
                <div className="stat-lbl">Total Suburb Pages</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ fontSize: 20, color: '#10b981' }}>{ledger?.totalBlogs || 0}</div>
                <div className="stat-lbl">Total Blog Posts</div>
              </div>
            </div>

            {/* Full publish timeline */}
            <div className="section">
              <div className="sec-title">Publish Timeline (All Entries)</div>
              <div className="card">
                <table>
                  <thead><tr><th>First Published</th><th>Type</th><th>Page</th></tr></thead>
                  <tbody>
                    {(ledger?.entries || []).slice().sort((a, b) => new Date(b.firstPublished) - new Date(a.firstPublished)).map((e, i) => {
                      const d = new Date(e.firstPublished)
                      const dateStr = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear()
                      const isRecent = (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
                      return (
                        <tr key={i}>
                          <td style={{ color: isRecent ? '#f59e0b' : '#fff', fontWeight: 600 }}>{dateStr}{isRecent ? ' 🔥' : ''}</td>
                          <td style={{ color: e.type === 'suburb' ? '#3b82f6' : '#a855f7' }}>{e.type}</td>
                          <td>{e.title || e.slug}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Safety Rules */}
            <div className="grid2" style={{ marginBottom: 16 }}>
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📄 Publish Limits</div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Max suburb pages/week:</span> {ledger?.weeklyPageLimit || 3}
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Max blog posts/week:</span> {ledger?.weeklyBlogLimit || 1}
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Tracked by:</span> Command Centre ledger (timestamped)
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📍 Google Business Profile</div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Max GBP posts/week:</span> 2-3
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Photo uploads/week:</span> 3-5 max
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0' }}>
                  <span style={{color:'#fff',fontWeight:600}}>⚠️ Avoid:</span> Bulk uploads, keyword-stuffed posts
                </div>
              </div>
            </div>

            {!ledger && (
              <div style={{ color: '#555', fontSize: 11, fontStyle: 'italic', padding: 16, textAlign: 'center' }}>
                Publish ledger not loaded — waiting for next snapshot refresh
              </div>
            )}
          </>
        )}

        {/* TAB: News Bank */}
        {tab === 'news-bank' && (
          <>
            {(() => {
              const nb = seoDash?.newsBank
              const stories = nb?.stories || []
              const published = stories.filter(s => s.status === 'published')
              const available = stories.filter(s => s.status !== 'published')
              return (
                <>
                  <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
                    <div className="stat-card" style={{minWidth:80}}><div className="stat-val" style={{fontSize:20,color:'#f59e0b'}}>{available.length}</div><div className="stat-lbl">Available</div></div>
                    <div className="stat-card" style={{minWidth:80}}><div className="stat-val" style={{fontSize:20,color:'#10b981'}}>{published.length}</div><div className="stat-lbl">Published</div></div>
                    <div className="stat-card" style={{minWidth:80}}><div className="stat-val" style={{fontSize:20,color:'#3b82f6'}}>{stories.length}</div><div className="stat-lbl">Total</div></div>
                  </div>
                  {available.length > 0 && (
                    <div className="section"><div className="sec-title">📦 Available Stories ({available.length})</div><div className="card">
                      {available.map((s, i) => (
                        <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid #1a1a1a',fontSize:11,alignItems:'center'}}>
                          <span style={{fontSize:8,color:'#f59e0b',fontWeight:600,minWidth:60,textTransform:'uppercase',background:'#2a200033',padding:'2px 6px',borderRadius:3}}>{s.type || 'story'}</span>
                          <span style={{color:'#fff',flex:1,fontWeight:500}}>{s.title}</span>
                          {s.category && <span style={{fontSize:8,color:'#888',background:'#1a1a22',padding:'2px 6px',borderRadius:3}}>{s.category}</span>}
                        </div>
                      ))}
                    </div></div>
                  )}
                  {published.length > 0 && (
                    <div className="section"><div className="sec-title">✅ Published ({published.length})</div><div className="card">
                      {published.map((s, i) => (
                        <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid #1a1a1a',fontSize:11}}>
                          <span style={{fontSize:8,color:'#10b981',fontWeight:600,minWidth:60}}>✅ {s.type || 'story'}</span>
                          <span style={{color:'#888',flex:1}}>{s.title}</span>
                        </div>
                      ))}
                    </div></div>
                  )}
                  {stories.length === 0 && <div style={{textAlign:'center',padding:30,color:'#333'}}><div style={{fontSize:24,marginBottom:8}}>📰</div><div style={{fontSize:11,color:'#555'}}>No stories in news bank yet</div></div>}
                </>
              )
            })()}
          </>
        )}

        {/* TAB: Suggestions */}
        {tab === 'suggestions' && (
          <>
            {(() => {
              const nbhwSugg = snap?.nbhwSuggestions?.suggestions || []
              return (
                <>
                  <div className="section">
                    <div className="sec-title">💡 Suggestions — What Needs Changing</div>
                    <div className="card" style={{marginBottom:16}}>
                      <div style={{fontSize:11,color:'#aaa',marginBottom:10}}>Spotted something that needs updating on the site? Submit it here.</div>
                      <textarea id="nbhw-sugg-input" placeholder="e.g. 'Update the phone number' or 'Add a new suburb page for...'"
                        style={{width:'100%',minHeight:80,padding:12,background:'#0a0a0a',border:'1px solid #222',borderRadius:8,color:'#fff',fontSize:12,fontFamily:'inherit',resize:'vertical',outline:'none'}} />
                      <button onClick={async () => {
                        const el = document.getElementById('nbhw-sugg-input')
                        if (!el?.value?.trim()) return
                        try {
                          await fetch('/api/nbhw-suggestions', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:el.value.trim()}) })
                          el.value = ''
                          window.location.reload()
                        } catch {}
                      }} style={{marginTop:8,padding:'8px 20px',background:'#10b981',border:'none',borderRadius:6,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                        📨 Submit
                      </button>
                    </div>
                  </div>
                  {nbhwSugg.length > 0 && (
                    <div className="section">
                      <div className="sec-title">Previous Suggestions ({nbhwSugg.length})</div>
                      <div className="card">
                        {nbhwSugg.map((s, i) => {
                          const sc = s.status === 'done' ? '#10b981' : s.status === 'in-progress' ? '#f59e0b' : '#3b82f6'
                          return (
                            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid #1a1a1a',display:'flex',gap:8}}>
                              <span style={{fontSize:9,color:sc,fontWeight:700,minWidth:70}}>{s.status === 'done' ? '✅ Done' : s.status === 'in-progress' ? '🔨 WIP' : '🆕 New'}</span>
                              <div style={{flex:1}}><div style={{fontSize:11,color:'#fff'}}>{s.text}</div><div style={{fontSize:8,color:'#555'}}>{s.submittedBy || 'Adam'} · {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</div></div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {nbhwSugg.length === 0 && <div style={{color:'#555',fontSize:11,fontStyle:'italic',padding:16,textAlign:'center'}}>No suggestions yet</div>}
                </>
              )
            })()}
          </>
        )}

        {/* TAB: GBP Posts */}
        {tab === 'gbp-posts' && (
          <GbpPosts
            posts={snap?.nbhwGmbPosts?.posts || []}
            label="NBHW"
            actionEndpoint="/api/nbhw-gbp-action"
          />
        )}

        {/* TAB: Future Posts */}
        {tab === 'future-posts' && (
          <>
            {(() => {
              const drafts = snap?.nbhwDrafts?.drafts || []
              const pending = drafts.filter(d => ['draft','editing'].includes(d.status))
              const approved = drafts.filter(d => d.status === 'approved')
              const visualCheck = drafts.filter(d => d.status === 'visual-check-pending')
              const signedOff = drafts.filter(d => d.status === 'signed-off')

              const doAction = async (id, action, extra = {}) => {
                try {
                  await fetch('/api/nbhw-draft-action', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,action,...extra}) })
                  window.location.reload()
                } catch {}
              }

              const statusColor = { 'draft':'#3b82f6','editing':'#f59e0b','approved':'#10b981','visual-check-pending':'#a855f7','signed-off':'#10b981' }
              const statusLabel = { 'draft':'📝 Draft','editing':'✏️ Editing','approved':'✅ Approved','visual-check-pending':'👁️ Visual Check','signed-off':'🏁 Signed Off' }

              const DraftCard = ({ draft: d }) => (
                <div style={{background:'#111',border:'1px solid #222',borderRadius:10,padding:14,marginBottom:10,borderLeft:`3px solid ${statusColor[d.status] || '#333'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{fontSize:8,padding:'2px 8px',borderRadius:4,fontWeight:600,background:`${statusColor[d.status]}20`,color:statusColor[d.status]}}>{statusLabel[d.status] || d.status}</span>
                    <span style={{fontSize:8,padding:'2px 8px',borderRadius:4,background:'#1a1a22',color:'#888',textTransform:'uppercase'}}>{d.type}</span>
                    <span style={{flex:1}}></span>
                    {d.targetDate && <span style={{fontSize:9,color:'#888'}}>Target: {d.targetDate}</span>}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:8}}>{d.title}</div>
                  <div style={{background:'#0a0a0d',border:'1px solid #1a1a22',borderRadius:8,padding:12,marginBottom:8,maxHeight:200,overflowY:'auto',fontSize:11,color:'#ccc',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{d.editedContent || d.content}</div>
                  {d.photos?.length > 0 && (
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                      {d.photos.map((p, i) => <div key={i} style={{width:60,height:60,background:'#1a1a22',borderRadius:6,overflow:'hidden'}}><img src={p} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>)}
                    </div>
                  )}
                  {d.status === 'visual-check-pending' && (
                    <div style={{display:'flex',gap:12,marginBottom:8,padding:10,background:'#0a0a1a',borderRadius:6,border:'1px solid #a855f733'}}>
                      <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:11,color:d.desktopChecked?'#10b981':'#888'}}>
                        <input type="checkbox" checked={d.desktopChecked} onChange={() => doAction(d.id,'check-desktop')} style={{width:16,height:16}} /> ✅ Desktop
                      </label>
                      <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:11,color:d.mobileChecked?'#10b981':'#888'}}>
                        <input type="checkbox" checked={d.mobileChecked} onChange={() => doAction(d.id,'check-mobile')} style={{width:16,height:16}} /> ✅ Mobile
                      </label>
                    </div>
                  )}
                  <div style={{display:'flex',gap:6}}>
                    {['draft','editing'].includes(d.status) && (
                      <button onClick={() => doAction(d.id,'approve')} style={{padding:'6px 14px',background:'#10b981',border:'none',borderRadius:6,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>✅ Good to Go</button>
                    )}
                  </div>
                  <div style={{fontSize:8,color:'#444',marginTop:6}}>By {d.author} · {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</div>
                </div>
              )

              return (
                <>
                  <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
                    {[{label:'Pending',count:pending.length,color:'#3b82f6'},{label:'Approved',count:approved.length,color:'#10b981'},{label:'Visual Check',count:visualCheck.length,color:'#a855f7'},{label:'Signed Off',count:signedOff.length,color:'#10b981'}].map((s,i) => (
                      <div key={i} style={{background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'6px 14px',textAlign:'center',minWidth:80}}>
                        <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.count}</div>
                        <div style={{fontSize:8,color:'#888',textTransform:'uppercase'}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {visualCheck.length > 0 && <div style={{marginBottom:14}}><div className="sec-title" style={{color:'#a855f7'}}>👁️ Visual Check Required ({visualCheck.length})</div>{visualCheck.map(d => <DraftCard key={d.id} draft={d} />)}</div>}
                  {pending.length > 0 && <div style={{marginBottom:14}}><div className="sec-title">📝 Drafts for Review ({pending.length})</div>{pending.map(d => <DraftCard key={d.id} draft={d} />)}</div>}
                  {approved.length > 0 && <div style={{marginBottom:14}}><div className="sec-title">✅ Approved ({approved.length})</div>{approved.map(d => <DraftCard key={d.id} draft={d} />)}</div>}
                  {signedOff.length > 0 && <div style={{marginBottom:14}}><div className="sec-title">🏁 Signed Off ({signedOff.length})</div>{signedOff.slice(0,5).map(d => <DraftCard key={d.id} draft={d} />)}</div>}
                  {drafts.length === 0 && <div style={{textAlign:'center',padding:40,color:'#333'}}><div style={{fontSize:32,marginBottom:8}}>📮</div><div style={{fontSize:13,color:'#555'}}>No future posts yet</div></div>}
                </>
              )
            })()}
          </>
        )}

        {/* TAB: Conversions (same data as Traffic, funnel view) */}
        {tab === 'conversions' && (
          <>
            <div className="section">
              <div className="sec-title">📞 Conversion Funnel</div>
              {traffic?.totals?.views != null ? (
                <div className="card" style={{padding:20}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,flexWrap:'wrap'}}>
                    <div style={{textAlign:'center',padding:'0 16px'}}><div style={{fontSize:28,fontWeight:800,color:'#a855f7'}}>{traffic.totals.visitors?.toLocaleString()}</div><div style={{fontSize:9,color:'#888',textTransform:'uppercase'}}>Visitors</div></div>
                    <div style={{fontSize:18,color:'#333',padding:'0 4px'}}>→</div>
                    <div style={{textAlign:'center',padding:'0 16px'}}><div style={{fontSize:28,fontWeight:800,color:'#3b82f6'}}>{traffic.totals.views?.toLocaleString()}</div><div style={{fontSize:9,color:'#888',textTransform:'uppercase'}}>Page Views</div></div>
                    <div style={{fontSize:18,color:'#333',padding:'0 4px'}}>→</div>
                    <div style={{textAlign:'center',padding:'0 16px'}}><div style={{fontSize:28,fontWeight:800,color:'#10b981'}}>{(traffic.totals.phoneTaps||0)+(traffic.totals.emailTaps||0)}</div><div style={{fontSize:9,color:'#888',textTransform:'uppercase'}}>Contact Clicks</div></div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontSize:9,color:'#555'}}>
                    <span>📞 {traffic.totals.phoneTaps || 0} phone</span>
                    <span>✉️ {traffic.totals.emailTaps || 0} email</span>
                    <span>Rate: {traffic.totals.conversionRate?.toFixed(1) || '0'}%</span>
                  </div>
                </div>
              ) : (
                <div className="card" style={{textAlign:'center',padding:20}}>
                  <div style={{fontSize:20,marginBottom:6}}>📞</div>
                  <div style={{color:'#555',fontSize:11}}>Conversion data in Traffic tab — awaiting GA4</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Today's Wins — always visible */}
        {seo?.todayWins?.length > 0 && (
          <div className="section" style={{marginTop:20}}>
            <div className="sec-title">Today's Wins</div>
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
