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
  return (
    <div style={{background:'#111',border:'1px solid #222',borderRadius:8,padding:10,marginBottom:6}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
        <span style={{width:8,height:8,borderRadius:'50%',background:colors[wave.status] || '#333',flexShrink:0}}></span>
        <span style={{fontSize:12,fontWeight:600,color:'#fff'}}>Wave {wave.id}</span>
        <span style={{fontSize:9,color:wave.status === 'active' ? '#ef4444' : '#555',fontWeight:600,textTransform:'uppercase'}}>
          {wave.status === 'active' ? '🔴 NOW' : wave.status === 'planned' ? '🟡 PLANNED' : '⬜ FUTURE'}
        </span>
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

export default function NbhwSeoPage() {
  const snap = useSnapshot()
  const seo = snap?.nbhwSeo

  const coreAt1 = seo?.coreKeywords?.filter(k => k.position === 1).length || 0
  const coreTotal = seo?.coreKeywords?.length || 0
  const suburbRanking = seo?.suburbKeywords?.filter(k => k.position <= 10).length || 0
  const suburbTotal = seo?.suburbKeywords?.length || 0

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NBHW SEO — Command Centre</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:16px;max-width:1000px;margin:0 auto}
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

        <div className="grid2">
          {/* Core Keywords */}
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

          {/* Suburb Keywords */}
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

        {/* Competitors */}
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

        {/* Suburb Coverage Waves */}
        <div className="section">
          <div className="sec-title">Suburb Coverage — Execution Waves</div>
          {seo?.suburbCoverage?.waves?.map(wave => (
            <WaveBar key={wave.id} wave={wave} />
          ))}
        </div>

        {/* Today's Wins */}
        {seo?.todayWins?.length > 0 && (
          <div className="section">
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
