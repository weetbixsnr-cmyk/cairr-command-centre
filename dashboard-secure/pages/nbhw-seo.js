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
  const live = snap?.nbhwLive
  const kw = snap?.nbhwKeywords
  const [tab, setTab] = useState('rankings')

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
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          <TabButton active={tab==='rankings'} label="📊 Rankings" onClick={() => setTab('rankings')} />
          <TabButton active={tab==='matrix'} label="📍 Coverage Matrix" onClick={() => setTab('matrix')} />
          <TabButton active={tab==='framework'} label="📋 Framework" onClick={() => setTab('framework')} />
          <TabButton active={tab==='competitors'} label="🏆 Competitors" onClick={() => setTab('competitors')} />
          <TabButton active={tab==='safety'} label={`🛡️ Google Safety${pub?.status === 'at_limit' ? ' 🔴' : pub?.status === 'caution' ? ' 🟡' : ''}`} onClick={() => setTab('safety')} />
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

        {/* TAB 5: Google Safety Meter */}
        {tab === 'safety' && (
          <>
            {/* Status Banner */}
            <div style={{
              background: pub?.status === 'at_limit' ? '#3b1010' : pub?.status === 'caution' ? '#2a2000' : '#0a2a1a',
              border: `1px solid ${pub?.status === 'at_limit' ? '#ef4444' : pub?.status === 'caution' ? '#f59e0b' : '#10b981'}`,
              borderRadius: 10, padding: 16, marginBottom: 16, textAlign: 'center'
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: pub?.status === 'at_limit' ? '#ef4444' : pub?.status === 'caution' ? '#f59e0b' : '#10b981' }}>
                {pub?.statusLabel || '⏳ Loading...'}
              </div>
              {pub?.nextSafeDate && pub?.status === 'at_limit' && (
                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>Next safe publish: {pub.nextSafeDate}</div>
              )}
            </div>

            {/* Gauges */}
            <div className="grid2" style={{ marginBottom: 16 }}>
              {/* Pages gauge */}
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pages Published This Week</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: pub?.status === 'at_limit' ? '#ef4444' : pub?.status === 'caution' ? '#f59e0b' : '#10b981' }}>
                    {pub?.publishedThisWeek?.length || 0}
                  </div>
                  <div style={{ fontSize: 14, color: '#555' }}>/ {pub?.weeklyLimit || 3}</div>
                </div>
                <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: 8, borderRadius: 4,
                    width: `${Math.min(100, ((pub?.publishedThisWeek?.length || 0) / (pub?.weeklyLimit || 3)) * 100)}%`,
                    background: pub?.status === 'at_limit' ? '#ef4444' : pub?.status === 'caution' ? '#f59e0b' : '#10b981',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>

              {/* GBP gauge */}
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>GBP Posts This Week</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: pub?.gbpStatus === 'at_limit' ? '#ef4444' : pub?.gbpStatus === 'caution' ? '#f59e0b' : '#10b981' }}>
                    {pub?.gbpThisWeek?.length || 0}
                  </div>
                  <div style={{ fontSize: 14, color: '#555' }}>/ {pub?.gbpWeeklyLimit || 3}</div>
                </div>
                <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: 8, borderRadius: 4,
                    width: `${Math.min(100, ((pub?.gbpThisWeek?.length || 0) / (pub?.gbpWeeklyLimit || 3)) * 100)}%`,
                    background: pub?.gbpStatus === 'at_limit' ? '#ef4444' : pub?.gbpStatus === 'caution' ? '#f59e0b' : '#10b981',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Safety Rules Reference */}
            <div className="grid2" style={{ marginBottom: 16 }}>
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📄 Website Page Limits</div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Max new pages/week:</span> 3 (suburb + blogs combined)
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Max suburb pages/week:</span> 1-2
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Cool-down after bulk:</span> 7 days
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Rule:</span> Log EVERY publish with date
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📍 Google Business Profile Limits</div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Max GBP posts/week:</span> 2-3
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Post types:</span> Updates, Offers, Events
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Photo uploads/week:</span> 3-5 max
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{color:'#fff',fontWeight:600}}>Review replies/day:</span> 2-3 (stagger, don't batch)
                </div>
                <div style={{ fontSize: 10, color: '#aaa', padding: '3px 0' }}>
                  <span style={{color:'#fff',fontWeight:600}}>⚠️ Avoid:</span> Bulk photo uploads, keyword-stuffed posts, same-day post spam
                </div>
              </div>
            </div>

            {/* Published this week */}
            {pub?.publishedThisWeek?.length > 0 && (
              <div className="section">
                <div className="sec-title">Published This Week</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Date</th><th>Type</th><th>Page</th><th>Status</th></tr></thead>
                    <tbody>
                      {pub.publishedThisWeek.map((p, i) => (
                        <tr key={i}>
                          <td style={{ color: '#fff', fontWeight: 600 }}>{p.date}</td>
                          <td>{p.type}</td>
                          <td>{p.page}</td>
                          <td>{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Queue */}
            {pub?.queue?.length > 0 && (
              <div className="section">
                <div className="sec-title">Queue — Do Not Publish Yet</div>
                <div className="card">
                  {pub.queue.map((q, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#aaa', padding: '5px 0', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: 6 }}>
                      <span style={{ color: '#f59e0b' }}>⏳</span> {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous weeks */}
            {pub?.previousWeeks?.length > 0 && (
              <div className="section">
                <div className="sec-title">Publish History (Last 30 Days)</div>
                <div className="card">
                  <table>
                    <thead><tr><th>Week</th><th>Pages Published</th><th>Type</th></tr></thead>
                    <tbody>
                      {pub.previousWeeks.map((w, i) => (
                        <tr key={i}>
                          <td style={{ color: '#fff' }}>{w.week}</td>
                          <td>{w.pages}</td>
                          <td style={{ fontSize: 9, color: '#555' }}>{w.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warning callout */}
            {pub?.warningStatus?.length > 0 && (
              <div style={{ background: '#3b1010', border: '1px solid #ef4444', borderRadius: 8, padding: 12, marginTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 6 }}>⚠️ Active Warning</div>
                {pub.warningStatus.map((w, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#f59e0b', padding: '2px 0' }}>{w}</div>
                ))}
              </div>
            )}

            {!pub && (
              <div style={{ color: '#555', fontSize: 11, fontStyle: 'italic', padding: 16, textAlign: 'center' }}>
                Publish log not loaded — NBHW agent hasn't created publish-log.md yet
              </div>
            )}
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
