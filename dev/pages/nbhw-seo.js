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
        <span style={{fontSize:9,color:'#555',marginLeft:'auto'}}>
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
      <div style={{fontSize:9,color:'#555'}}>{wave.scope}</div>
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
  const [tab, setTab] = useState('rankings')

  const coreAt1 = seo?.coreKeywords?.filter(k => k.position === 1).length || 0
  const coreTotal = seo?.coreKeywords?.length || 0
  const suburbRanking = seo?.suburbKeywords?.filter(k => k.position <= 10).length || 0
  const suburbTotal = seo?.suburbKeywords?.length || 0
  const totalServicePages = seo?.suburbCoverage?.waves?.reduce((a, w) => a + (w.servicePages || 0), 0) || 0
  const totalServicePagesNeeded = seo?.suburbCoverage?.waves?.reduce((a, w) => a + (w.servicePagesTotal || 0), 0) || 0
  const totalBlogs = seo?.suburbCoverage?.waves?.reduce((a, w) => a + (w.blogs || 0), 0) || 0

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
          .meta{font-size:9px;color:#444}
          .stats{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
          .stat-card{padding:12px 16px;background:#111;border:1px solid #222;border-radius:10px;text-align:center;min-width:120px}
          .stat-val{font-size:24px;font-weight:700}
          .stat-lbl{font-size:9px;color:#555;margin-top:2px}
          .section{margin-bottom:20px}
          .sec-title{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:4px}
          .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          @media(max-width:600px){.grid2{grid-template-columns:1fr}}
          .card{background:#111;border:1px solid #222;border-radius:10px;padding:12px}
          table{width:100%;border-collapse:collapse;font-size:11px}
          th{text-align:left;font-size:9px;color:#555;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-bottom:1px solid #222}
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
            <div className="stat-val" style={{color:'#3b82f6'}}>{seo?.suburbCoverage?.summary?.withBlogCoverage || 0}</div>
            <div className="stat-lbl">Suburbs with Content</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#f59e0b'}}>{seo?.suburbCoverage?.summary?.servicePages || 0}</div>
            <div className="stat-lbl">Service Pages Built</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ef4444'}}>{seo?.suburbCoverage?.summary?.zeroCoverage || 0}</div>
            <div className="stat-lbl">Suburbs Zero Coverage</div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          <TabButton active={tab==='rankings'} label="📊 Rankings" onClick={() => setTab('rankings')} />
          <TabButton active={tab==='matrix'} label="📍 Coverage Matrix" onClick={() => setTab('matrix')} />
          <TabButton active={tab==='framework'} label="📋 Framework" onClick={() => setTab('framework')} />
        </div>

        {/* TAB 1: Rankings */}
        {tab === 'rankings' && (
          <>
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
                <div className="stat-val" style={{fontSize:18,color:'#3b82f6'}}>{totalBlogs}</div>
                <div className="stat-lbl">Total Blogs</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#f59e0b'}}>{totalServicePages}/{totalServicePagesNeeded}</div>
                <div className="stat-lbl">Service Pages</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#10b981'}}>{seo?.suburbCoverage?.summary?.totalSuburbs || 0}</div>
                <div className="stat-lbl">Suburbs Mapped</div>
              </div>
              <div className="stat-card" style={{minWidth:100}}>
                <div className="stat-val" style={{fontSize:18,color:'#a855f7'}}>{seo?.suburbCoverage?.summary?.keywordsPerSuburb || 0}</div>
                <div className="stat-lbl">Keywords/Suburb</div>
              </div>
            </div>
            <div className="section">
              <div className="sec-title">Execution Waves</div>
              {seo?.suburbCoverage?.waves?.map(wave => (
                <WaveBar key={wave.id} wave={wave} />
              ))}
            </div>
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
                  <div style={{fontSize:9,color:'#555'}}>Google Reviews</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#3b82f6'}}>{seo?.assets?.unusedPhotos || 0}</div>
                  <div style={{fontSize:9,color:'#555'}}>Unused Photos</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'#10b981'}}>{seo?.assets?.photoCategories || 0}</div>
                  <div style={{fontSize:9,color:'#555'}}>Photo Categories</div>
                </div>
              </div>
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
