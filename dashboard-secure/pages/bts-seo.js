import Head from 'next/head'
import { useState, useEffect } from 'react'
import SeoDashboard from './components/seo-dashboard'

// Inline section finder for rendering SEO-DASHBOARD.md sections in native tabs
function findDashSection(sections, key, fallbacks) {
  if (!sections) return null
  if (sections[key]) return sections[key]
  for (const fb of (fallbacks || [])) {
    const found = Object.entries(sections).find(([k]) => k.includes(fb))
    if (found) return found[1]
  }
  return null
}

function DashSection({ section, icon, maxLines }) {
  if (!section) return null
  const lines = (maxLines ? section.lines.slice(0, maxLines) : section.lines) || []
  return (
    <div style={{background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
        {icon} {section.title}
      </div>
      {lines.map((line, i) => {
        const t = (line || '').trim()
        if (!t) return null
        if (t.startsWith('|') && !t.startsWith('|--') && !t.startsWith('| -')) {
          const cells = t.split('|').filter(Boolean).map(c => c.trim())
          const isHdr = i === 0 || (lines[i+1] && lines[i+1].trim().startsWith('|--'))
          return <div key={i} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid #111',fontSize:10}}>{cells.map((c,j) => <span key={j} style={{flex:1,color:isHdr?'#888':'#ccc',fontWeight:isHdr?600:400,fontSize:isHdr?9:10}}>{c.replace(/\*\*/g,'')}</span>)}</div>
        }
        if (/^\|[\s-|]+\|$/.test(t)) return null
        if (t.startsWith('- [x]')) return <div key={i} style={{fontSize:10,color:'#10b981',padding:'2px 0'}}>✅ {t.replace(/^- \[x\]\s*/,'').replace(/\*\*/g,'')}</div>
        if (t.startsWith('- [ ]')) return <div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>⬜ {t.replace(/^- \[\s?\]\s*/,'').replace(/\*\*/g,'')}</div>
        if (t.startsWith('🔴')||t.startsWith('🟠')||t.startsWith('🟡')||t.startsWith('🟢')) {
          const sc = t.startsWith('🔴')?'#ef4444':t.startsWith('🟠')?'#f59e0b':t.startsWith('🟡')?'#3b82f6':'#10b981'
          return <div key={i} style={{fontSize:10,color:sc,padding:'2px 0',fontWeight:500}}>{t.replace(/\*\*/g,'')}</div>
        }
        if (t.startsWith('- ')||t.startsWith('* ')) return <div key={i} style={{fontSize:10,color:'#aaa',padding:'2px 0',paddingLeft:8}}>• {t.replace(/^[-*]\s*/,'').replace(/\*\*/g,'')}</div>
        if (/^\d+\./.test(t)) return <div key={i} style={{fontSize:10,color:'#aaa',padding:'2px 0',paddingLeft:8}}>{t.replace(/\*\*/g,'')}</div>
        if (t.startsWith('**')&&t.endsWith('**')) return <div key={i} style={{fontSize:10,color:'#fff',fontWeight:700,padding:'4px 0 2px'}}>{t.replace(/\*\*/g,'')}</div>
        return <div key={i} style={{fontSize:10,color:'#aaa',padding:'1px 0'}}>{t.replace(/\*\*/g,'')}</div>
      })}
      {maxLines && section.lines.length > maxLines && <div style={{fontSize:9,color:'#555',marginTop:4}}>+{section.lines.length - maxLines} more</div>}
    </div>
  )
}
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
  const courses = snap?.btsCourseDetails
  const suggestions = snap?.btsSuggestions
  const notifications = snap?.btsNotifications?.notifications || []
  const compPages = snap?.btsCompetitorPages
  const courseData = snap?.btsCourses
  const seoDash = snap?.btsSeoDash
  const audit = snap?.btsSeoAudit
  const traffic = snap?.btsTraffic
  const [tab, setTab] = useState(seoDash ? 'health' : 'rankings')
  const [suggText, setSuggText] = useState('')
  const [suggSending, setSuggSending] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [suggSent, setSuggSent] = useState(false)
  const [suggError, setSuggError] = useState('')
  const [localSuggestions, setLocalSuggestions] = useState(null)
  const [liveSuggestions, setLiveSuggestions] = useState(null)
  const [draftResults, setDraftResults] = useState({})
  const [localDrafts, setLocalDrafts] = useState(null)

  // Fetch suggestions directly from API (not snapshot) so submitted ones persist
  useEffect(() => {
    if (tab === 'suggestions') {
      fetch('/api/bts-suggestions').then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.suggestions) setLiveSuggestions(data.suggestions) })
        .catch(() => {})
    }
  }, [tab])

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
            Updated: {seo ? timeAgo(seo.lastUpdated) : '—'}
          </span>
        </div>

        {/* Sunny Activity Notifications */}
        {notifications.filter(n => !n.seen).length > 0 && (
          <div style={{background:'#10b98115',border:'1px solid #10b98133',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
            <div style={{fontSize:10,color:'#10b981',fontWeight:700,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>
              🔔 Sunny Activity ({notifications.filter(n => !n.seen).length} new)
            </div>
            {notifications.filter(n => !n.seen).slice(0, 5).map(n => (
              <div key={n.id} style={{fontSize:11,color:'#ccc',padding:'3px 0',borderBottom:'1px solid #1a1a1a',display:'flex',justifyContent:'space-between'}}>
                <span>{n.action === 'approve' ? '✅' : n.action === 'reject' ? '↩️' : '✏️'} {n.message}</span>
                <span style={{fontSize:9,color:'#666'}}>{n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        )}

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
          const gauges = [
            {label:'blogs',used:btsL?.last7d?.blogs||0,limit:btsL?.weeklyBlogLimit||3},
            {label:'GBP',used:btsL?.last7d?.gbp||0,limit:btsL?.weeklyGbpLimit||3},
            {label:'news',used:btsL?.last7d?.news||0,limit:btsL?.weeklyNewsLimit||1},
            {label:'pages',used:btsL?.last7d?.pages||0,limit:btsL?.weeklyPageLimit||3},
          ]
          return (
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              {gauges.map((g,i) => {
                const over = g.used > g.limit
                const gc = over ? '#ef4444' : g.used >= g.limit ? '#f59e0b' : '#10b981'
                return (
                  <div key={i} style={{flex:1,minWidth:100,background:'#0d0d10',border:`1px solid ${gc}33`,borderRadius:8,padding:'8px 14px',borderLeft:`3px solid ${gc}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:18,fontWeight:800,color:gc}}>{g.used}/{g.limit}</span>
                      <span style={{fontSize:9,color:'#888'}}>{g.label}</span>
                    </div>
                    <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginTop:4,overflow:'hidden'}}>
                      <div style={{height:4,width:`${Math.min(100,(g.used/g.limit)*100)}%`,background:gc,borderRadius:2}}></div>
                    </div>
                  </div>
                )
              })}
              <div style={{minWidth:80,background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'8px 14px',textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:800,color:brC}}>{st === 'green' ? '🟢' : st === 'amber' ? '🟡' : '🔴'}</div>
                <div style={{fontSize:8,color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Safety</div>
              </div>
            </div>
          )
        })()}

        {/* Tab navigation — RIGHT after stats + safety strip */}
        <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none'}}>
          <TabButton active={tab==='health'} label="🏥 SEO Health" onClick={() => setTab('health')} />
          <TabButton active={tab==='seo-plan'} label="📋 SEO Plan" onClick={() => setTab('seo-plan')} />
          <TabButton active={tab==='rankings'} label="📊 Rankings" onClick={() => setTab('rankings')} />
          <TabButton active={tab==='matrix'} label="📍 Coverage Matrix" onClick={() => setTab('matrix')} />
          <TabButton active={tab==='competitors'} label="🏆 Competitors" onClick={() => setTab('competitors')} />
          <TabButton active={tab==='safety'} label="🛡️ Google Safety" onClick={() => setTab('safety')} />
          <TabButton active={tab==='news-bank'} label="📰 News Bank" onClick={() => setTab('news-bank')} />
          <TabButton active={tab==='suggestions'} label="💡 Suggestions" onClick={() => setTab('suggestions')} />
          <TabButton active={tab==='gbp-posts'} label="📍 GBP Posts" onClick={() => setTab('gbp-posts')} />
          <TabButton active={tab==='future-posts'} label="📮 Future Posts" onClick={() => setTab('future-posts')} />
          <TabButton active={tab==='traffic'} label="📊 Traffic" onClick={() => setTab('traffic')} />
          <TabButton active={tab==='conversions'} label="📞 Conversions" onClick={() => setTab('conversions')} />
          <TabButton active={tab==='courses'} label="📚 Courses" onClick={() => setTab('courses')} />
        </div>

        {/* TAB: SEO Health */}
        {tab === 'health' && (
          <>
            {/* Plan Status & Overview + Critical Fixes (from SEO-DASHBOARD.md) */}
            <DashSection section={findDashSection(seoDash?.sections, 'plan-overview', ['plan', 'overview', 'plan-status'])} icon="📋" maxLines={30} />
            <DashSection section={findDashSection(seoDash?.sections, 'critical-fixes', ['critical', 'fixes', 'blockers'])} icon="🔴" maxLines={40} />

            <div className="grid2" style={{marginBottom:16}}>
              {/* SEO Health Score Gauge */}
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

              {/* GEO Readiness Gauge */}
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

            {/* Action Plan */}
            {audit?.actions?.length > 0 && (
              <div className="card" style={{marginBottom:16}}>
                <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>📋 Action Plan</div>
                {['critical','high','medium','low'].map(sev => {
                  const items = audit.actions.filter(a => a.severity === sev)
                  if (items.length === 0) return null
                  const sevColor = sev === 'critical' ? '#ef4444' : sev === 'high' ? '#f59e0b' : sev === 'medium' ? '#3b82f6' : '#888'
                  const sevIcon = sev === 'critical' ? '🔴' : sev === 'high' ? '🟠' : sev === 'medium' ? '🟡' : '⚪'
                  return (
                    <div key={sev} style={{marginBottom:8}}>
                      <div style={{fontSize:9,color:sevColor,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{sevIcon} {sev} ({items.length})</div>
                      {items.map((item, i) => (
                        <div key={i} style={{fontSize:10,color:'#aaa',padding:'3px 0',borderBottom:'1px solid #1a1a1a',display:'flex',gap:6}}>
                          <span style={{flex:1}}>{item.title}</span>
                          {item.page && <span style={{fontSize:8,color:'#555',fontFamily:'monospace'}}>{item.page}</span>}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {audit?.source === 'placeholder' && (
              <div style={{textAlign:'center',padding:12,background:'#111',border:'1px solid #222',borderRadius:8}}>
                <span style={{fontSize:10,color:'#f59e0b'}}>⏳ Awaiting full BTS SEO audit — scores will populate automatically</span>
              </div>
            )}
          </>
        )}

        {/* TAB: SEO Plan (standardised format) */}
        {tab === 'seo-plan' && (
          <SeoDashboard seoDash={seoDash} publishLedger={snap?.btsPublishLedger} label="BTS"
            skipSections={['plan-overview','critical-fixes','coverage-matrix','publish-history','competitor-watch','plan','critical','coverage','publish','competitor']} />
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
                      {seo?.coreKeywords?.slice().sort((a, b) => a.position - b.position).map((k, i) => (
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
                      {seo?.locationKeywords?.slice().sort((a, b) => a.position - b.position).map((k, i) => (
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
            {/* Blog Pipeline */}
            <div className="section" style={{marginBottom:16}}>
              <div className="sec-title">📝 Blog Pipeline — {blogs?.published || 0} published · {(blogs?.planned || []).filter(b => b.status === 'draft' || b.status === 'in-progress').length || 0} drafts · {(blogs?.planned || []).filter(b => b.status === 'not-started').length || 0} planned</div>
              <div className="card">
                {blogs?.planned?.length > 0 ? blogs.planned.slice(0, 10).map((b, i) => {
                  const sColor = b.status === 'published' ? '#10b981' : b.status === 'draft' || b.status === 'in-progress' ? '#f59e0b' : '#555'
                  const sLabel = b.status === 'published' ? '✅ LIVE' : b.status === 'draft' ? '📝 DRAFT' : b.status === 'in-progress' ? '🔨 WIP' : '⬜ PLANNED'
                  return (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid #1a1a1a',fontSize:11}}>
                      <span style={{fontSize:9,color:sColor,fontWeight:600,minWidth:70}}>{sLabel}</span>
                      <span style={{color:'#fff',fontWeight:500,flex:1}}>{b.title}</span>
                      <span style={{fontSize:9,color:'#888'}}>{b.service}</span>
                    </div>
                  )
                }) : <div style={{color:'#333',fontSize:11,fontStyle:'italic'}}>No blogs in pipeline</div>}
                {(blogs?.planned?.length || 0) > 10 && <div style={{fontSize:9,color:'#555',marginTop:4,textAlign:'right'}}>+{blogs.planned.length - 10} more</div>}
              </div>
            </div>

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

            {/* Coverage Matrix (from SEO-DASHBOARD.md) — Content Published removed, already on Google Safety tab as Publish Timeline */}
            <DashSection section={findDashSection(seoDash?.sections, 'coverage-matrix', ['coverage', 'matrix', 'service-location'])} icon="📍" maxLines={50} />
          </>
        )}

        {/* TAB 4: Competitors */}
        {tab === 'competitors' && (
          <>
            {/* Competitor Page Counts */}
            {comp?.pageCountCrawl?.counts && (
              <div className="section" style={{marginBottom:20}}>
                <div className="sec-title">📊 Page Count Comparison — Crawled {comp.pageCountCrawl.crawledAt ? new Date(comp.pageCountCrawl.crawledAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—'}</div>
                <div className="card">
                  <table>
                    <thead>
                      <tr>
                        <th>Competitor</th>
                        <th style={{textAlign:'right'}}>Site Pages</th>
                        <th style={{textAlign:'right'}}>Courses</th>
                        <th style={{textAlign:'right'}}>Blog Posts</th>
                        <th style={{textAlign:'right',fontWeight:700}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.pageCountCrawl.counts
                        .slice()
                        .sort((a, b) => b.total - a.total)
                        .map((c, i) => {
                          const isBts = c.isSelf
                          const rowStyle = isBts ? {background:'#0a1a2a',fontWeight:700} : {}
                          return (
                            <tr key={i} style={rowStyle}>
                              <td style={{color: isBts ? '#3b82f6' : '#fff', fontWeight: isBts ? 700 : 600}}>
                                {isBts ? '🎓 ' : ''}{c.name}
                              </td>
                              <td style={{textAlign:'right',color:'#aaa'}}>{c.sitePages}</td>
                              <td style={{textAlign:'right',color:'#aaa'}}>
                                {c.coursePages > 0 ? c.coursePages : <span style={{fontSize:8,color:'#555'}}>{c.courseNote || '—'}</span>}
                              </td>
                              <td style={{textAlign:'right',color:'#aaa'}}>{c.blogPosts.toLocaleString()}</td>
                              <td style={{textAlign:'right',fontWeight:700,color: isBts ? '#ef4444' : '#10b981',fontSize:13}}>
                                {c.total.toLocaleString()}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                  <div style={{marginTop:10,padding:'8px 0',borderTop:'1px solid #1a1a1a'}}>
                    <div style={{fontSize:9,color:'#ef4444',fontWeight:600}}>
                      ⚠️ BTS has {comp.pageCountCrawl.counts.find(c => c.isSelf)?.total || 0} pages vs avg competitor {Math.round(comp.pageCountCrawl.counts.filter(c => !c.isSelf).reduce((a, c) => a + c.total, 0) / comp.pageCountCrawl.counts.filter(c => !c.isSelf).length).toLocaleString()}
                    </div>
                    <div style={{fontSize:8,color:'#555',marginTop:2}}>Source: sitemap crawl · Re-checked each audit run</div>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback: compPages bar chart if no pageCountCrawl */}
            {!comp?.pageCountCrawl?.counts && compPages?.competitors?.length > 0 && (
              <div className="section" style={{marginBottom:16}}>
                <div className="sec-title">📊 Content Gap — Page Counts</div>
                <div className="card">
                  {(() => {
                    const sorted = [...compPages.competitors].sort((a, b) => b.total - a.total)
                    const maxTotal = sorted[0]?.total || 1
                    return sorted.map((c, i) => {
                      const isUs = c.ours
                      return (
                        <div key={i} style={{marginBottom:8,padding:isUs?'8px':'0',borderRadius:isUs?8:0,border:isUs?'1px solid #3b82f630':'none',background:isUs?'#0a1a2e':'transparent'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                            <span style={{fontSize:11,fontWeight:isUs?800:600,color:isUs?'#3b82f6':'#ccc',minWidth:100}}>{c.name}</span>
                            <span style={{fontSize:13,fontWeight:800,color:isUs?'#3b82f6':'#888',marginLeft:'auto'}}>{c.total.toLocaleString()}</span>
                          </div>
                          <div style={{height:isUs?10:6,background:'#1a1a1a',borderRadius:4,overflow:'hidden'}}>
                            <div style={{display:'flex',height:'100%'}}>
                              <div style={{width:`${(c.site/maxTotal)*100}%`,background:isUs?'#3b82f6':'#555',minWidth:c.site>0?2:0}}></div>
                              <div style={{width:`${(c.courses/maxTotal)*100}%`,background:isUs?'#a855f7':'#444',minWidth:c.courses>0?2:0}}></div>
                              <div style={{width:`${(c.blogs/maxTotal)*100}%`,background:isUs?'#10b981':'#333',minWidth:c.blogs>0?2:0}}></div>
                            </div>
                          </div>
                          <div style={{display:'flex',gap:10,marginTop:2,fontSize:8,color:'#555'}}>
                            <span>{c.site} site</span><span>{c.courses} courses</span><span>{c.blogs} blogs</span>
                          </div>
                        </div>
                      )
                    })
                  })()}
                  <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:8,fontSize:8}}>
                    <span style={{color:'#3b82f6'}}>■ Site</span>
                    <span style={{color:'#a855f7'}}>■ Courses</span>
                    <span style={{color:'#10b981'}}>■ Blogs</span>
                  </div>
                </div>
              </div>
            )}

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

            {/* Competitor Watch DashSection removed — structured competitor cards above already show same data */}

            <div style={{ fontSize: 8, color: '#333', marginTop: 8, textAlign: 'right' }}>
              Scan status: {comp?.scanStatus || 'pending'} · Updated: {comp?.updatedAt ? timeAgo(comp.updatedAt) : '—'}
            </div>
          </>
        )}

        {/* TAB 5: Course Details */}
        {tab === 'courses' && (
          <>
            {/* Summary strip */}
            <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
              <div className="stat-card" style={{minWidth:80}}>
                <div className="stat-val" style={{fontSize:18,color:'#10b981'}}>{courses?.summary?.live || (courses?.courses || []).filter(c => c.status === 'live').length}</div>
                <div className="stat-lbl">Live Pages</div>
              </div>
              <div className="stat-card" style={{minWidth:80}}>
                <div className="stat-val" style={{fontSize:18,color:'#3b82f6'}}>{courses?.summary?.confirmed || (courses?.courses || []).filter(c => c.confirmed).length}</div>
                <div className="stat-lbl">Confirmed</div>
              </div>
              <div className="stat-card" style={{minWidth:80}}>
                <div className="stat-val" style={{fontSize:18,color:'#f59e0b'}}>{courses?.summary?.missingInfo || (courses?.courses || []).filter(c => c.status === 'missing-info').length}</div>
                <div className="stat-lbl">Missing Info</div>
              </div>
              <div className="stat-card" style={{minWidth:80}}>
                <div className="stat-val" style={{fontSize:18,color:'#ef4444'}}>{courses?.summary?.broken || (courses?.courses || []).filter(c => c.status === 'broken').length}</div>
                <div className="stat-lbl">Broken</div>
              </div>
              <div className="stat-card" style={{minWidth:80}}>
                <div className="stat-val" style={{fontSize:18,color:'#888'}}>{courses?.summary?.noPage || (courses?.courses || []).filter(c => c.status === 'no-page').length}</div>
                <div className="stat-lbl">No Page</div>
              </div>
            </div>

            <div className="section">
              <div className="sec-title">📚 Course Details — Source of Truth</div>
              <div style={{fontSize:9,color:'#f59e0b',marginBottom:10,padding:'6px 10px',background:'#1a1800',border:'1px solid #2a2000',borderRadius:6}}>
                ⚠️ All content sent to Sunny must be cross-checked against these durations before publishing. Courses without confirmed pricing need Sunny to verify.
              </div>
              <div className="card">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th style={{textAlign:'center'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(courses?.courses || []).map((c, i) => {
                      const statusMap = {
                        'live': { icon: '✅', color: '#10b981', label: 'Live', bg: 'transparent' },
                        'missing-info': { icon: '❓', color: '#f59e0b', label: 'No Info', bg: '#1a1800' },
                        'broken': { icon: '⚠️', color: '#ef4444', label: '404', bg: '#1a0a0a' },
                        'no-page': { icon: '🚫', color: '#888', label: 'No Page', bg: '#0d0d0d' }
                      }
                      const st = statusMap[c.status] || statusMap['missing-info']
                      const isIssue = c.status !== 'live'
                      return (
                        <tr key={i} style={{background: st.bg}}>
                          <td style={{color: isIssue ? '#999' : '#fff', fontWeight:600}}>
                            {c.name}
                            {c.url && <div style={{fontSize:8,color:'#555',fontWeight:400}}>{c.url}</div>}
                          </td>
                          <td style={{color: c.confirmed ? '#aaa' : st.color, fontWeight: c.confirmed ? 400 : 600}}>
                            {c.duration}
                          </td>
                          <td style={{color: c.confirmed ? '#aaa' : st.color, fontWeight: c.confirmed ? 400 : 600}}>
                            {c.price}
                          </td>
                          <td style={{textAlign:'center'}}>
                            <span style={{fontSize:11,color: st.color,fontWeight:700}}>{st.icon}</span>
                            <div style={{fontSize:7,color: st.color,marginTop:1}}>{st.label}</div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{fontSize:8,color:'#555',marginTop:8,borderTop:'1px solid #1a1a1a',paddingTop:6}}>
                  Source: Brain live crawl · Updated: {courses?.updatedAt ? timeAgo(courses.updatedAt) : '—'}
                </div>
              </div>
            </div>

            {/* Issues from courseData if available */}
            {courseData?.issues?.length > 0 && (
              <div className="section">
                <div className="sec-title">⚠️ Known Issues</div>
                <div className="card" style={{background:'#1a0a0a',border:'1px solid #ef444433'}}>
                  {courseData.issues.map((issue, i) => (
                    <div key={i} style={{fontSize:10,color:'#ef4444',padding:'4px 0',borderBottom:'1px solid #1a1a1a'}}>• {issue}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 6: Suggestions */}
        {tab === 'suggestions' && (
          <>
            <div className="section">
              <div className="sec-title">💡 Suggestions — Tell Us What Needs Changing</div>
              <div className="card" style={{marginBottom:16}}>
                <div style={{fontSize:11,color:'#aaa',marginBottom:10}}>
                  Got an idea for the website? Spotted something that needs updating? Type it below and we&apos;ll action it.
                </div>
                <textarea
                  value={suggText}
                  onChange={e => setSuggText(e.target.value)}
                  placeholder="e.g. 'Update the CCN1 price to £750' or 'Add a new course page for...' or 'The phone number on the contact page is wrong'"
                  style={{
                    width:'100%',minHeight:100,padding:12,background:'#0a0a0a',border:'1px solid #222',borderRadius:8,
                    color:'#fff',fontSize:12,fontFamily:'inherit',resize:'vertical',outline:'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#222'}
                />
                <div style={{display:'flex',alignItems:'center',gap:12,marginTop:10}}>
                  <button
                    onClick={async () => {
                      if (!suggText.trim()) return
                      setSuggSending(true)
                      setSuggSent(false)
                      setSuggError('')
                      try {
                        const res = await fetch('/api/bts-suggestions', {
                          method: 'POST',
                          headers: {'Content-Type':'application/json'},
                          body: JSON.stringify({ text: suggText.trim() })
                        })
                        const data = await res.json()
                        if (data.ok) {
                          setSuggSent(true)
                          setSuggText('')
                          // Add to local list immediately
                          setLocalSuggestions(prev => {
                            const list = prev || liveSuggestions || suggestions?.suggestions || []
                            return [data.suggestion, ...list]
                          })
                          setTimeout(() => setSuggSent(false), 3000)
                        } else {
                          setSuggError(data.error || 'Failed to save — please try again')
                        }
                      } catch (e) {
                        setSuggError('Network error — please try again')
                      }
                      setSuggSending(false)
                    }}
                    disabled={suggSending || !suggText.trim()}
                    style={{
                      padding:'10px 24px',background: suggSending ? '#333' : '#10b981',border:'none',borderRadius:8,
                      color:'#fff',fontSize:12,fontWeight:700,cursor: suggSending ? 'not-allowed' : 'pointer',transition:'all .2s'
                    }}
                  >
                    {suggSending ? 'Sending...' : '📨 Submit Suggestion'}
                  </button>
                  {suggSent && <span style={{fontSize:11,color:'#10b981',fontWeight:600}}>✅ Submitted! We&apos;ll review it shortly.</span>}
                  {suggError && <span style={{fontSize:11,color:'#ef4444',fontWeight:600}}>{suggError}</span>}
                </div>
              </div>
            </div>

            {/* Previous Suggestions */}
            {(() => {
              const allSugg = localSuggestions || liveSuggestions || suggestions?.suggestions || []
              if (allSugg.length === 0) return (
                <div style={{color:'#555',fontSize:11,fontStyle:'italic',padding:16,textAlign:'center'}}>
                  No suggestions yet — be the first to submit one above!
                </div>
              )
              return (
                <div className="section">
                  <div className="sec-title">Previous Suggestions ({allSugg.length})</div>
                  <div className="card">
                    {allSugg.map((s, i) => {
                      const statusColor = s.status === 'done' ? '#10b981' : s.status === 'in-progress' ? '#f59e0b' : '#3b82f6'
                      const statusLabel = s.status === 'done' ? '✅ Done' : s.status === 'in-progress' ? '🔨 In Progress' : '🆕 New'
                      return (
                        <div key={s.id || i} style={{padding:'10px 0',borderBottom:'1px solid #1a1a1a',display:'flex',gap:10,alignItems:'flex-start'}}>
                          <span style={{fontSize:9,color:statusColor,fontWeight:700,minWidth:80,paddingTop:2}}>{statusLabel}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,color:'#fff',marginBottom:2}}>{s.text}</div>
                            <div style={{fontSize:8,color:'#555'}}>
                              {s.submittedBy || 'Sunny'} · {s.submittedAt ? timeAgo(s.submittedAt) : '—'}
                              {s.response && <span style={{color:'#aaa'}}> · Reply: {s.response}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {/* TAB 7: Google Safety */}
        {tab === 'safety' && (
          <>
            {(() => {
              const btsLedger = snap?.btsPublishLedger
              const st = btsLedger?.status || 'green'
              const bgC = st === 'red' ? '#3b1010' : st === 'amber' ? '#2a2000' : '#0a2a1a'
              const brC = st === 'red' ? '#ef4444' : st === 'amber' ? '#f59e0b' : '#10b981'
              const typeColors = { blog: '#a855f7', news: '#f59e0b', gbp: '#3b82f6', location: '#10b981', suburb: '#10b981' }

              function LimitGauge({ label, used, limit, color }) {
                const over = used > limit
                const atLimit = used >= limit
                const c = over ? '#ef4444' : atLimit ? '#f59e0b' : color || '#10b981'
                return (
                  <div className="card" style={{flex:'1 1 140px',minWidth:140}}>
                    <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{label} — 7 Days</div>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                      <div style={{fontSize:36,fontWeight:800,color:c}}>{used}</div>
                      <div style={{fontSize:14,color:'#555'}}>/ {limit}</div>
                    </div>
                    <div style={{height:8,background:'#1a1a1a',borderRadius:4,overflow:'hidden'}}>
                      <div style={{height:8,borderRadius:4,width:`${Math.min(100,(used/limit)*100)}%`,background:c,transition:'width 0.3s'}}></div>
                    </div>
                    <div style={{fontSize:9,color: over ? '#ef4444' : '#555',marginTop:4,fontWeight: over ? 700 : 400}}>
                      {over ? `⚠️ ${used - limit} over limit` : `${limit - used} slots remaining`}
                    </div>
                  </div>
                )
              }

              return (
                <>
                  {/* Status Banner */}
                  <div style={{background:bgC,border:`1px solid ${brC}`,borderRadius:10,padding:16,marginBottom:16,textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:700,color:brC}}>{btsLedger?.statusLabel || '🟢 No publishes yet'}</div>
                  </div>

                  {/* Weekly Limit Gauges — ALL content types */}
                  <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
                    <LimitGauge label="📄 Location Pages" used={btsLedger?.last7d?.pages || 0} limit={btsLedger?.weeklyPageLimit || 3} color="#10b981" />
                    <LimitGauge label="📝 Blog Posts" used={btsLedger?.last7d?.blogs || 0} limit={btsLedger?.weeklyBlogLimit || 3} color="#a855f7" />
                    <LimitGauge label="📍 GBP Posts" used={btsLedger?.last7d?.gbp || 0} limit={btsLedger?.weeklyGbpLimit || 3} color="#3b82f6" />
                    <LimitGauge label="📰 News Posts" used={btsLedger?.last7d?.news || 0} limit={btsLedger?.weeklyNewsLimit || 1} color="#f59e0b" />
                  </div>

                  {/* 30-day + Total summary */}
                  <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                    {[
                      {label:'Pages (30d)',val:btsLedger?.last30d?.pages||0,color:'#10b981'},
                      {label:'Blogs (30d)',val:btsLedger?.last30d?.blogs||0,color:'#a855f7'},
                      {label:'GBP (30d)',val:btsLedger?.last30d?.gbp||0,color:'#3b82f6'},
                      {label:'News (30d)',val:btsLedger?.last30d?.news||0,color:'#f59e0b'},
                      {label:'Total All Time',val:btsLedger?.entries?.length||0,color:'#888'},
                    ].map((s,i) => (
                      <div key={i} className="stat-card" style={{minWidth:80,flex:1}}>
                        <div className="stat-val" style={{fontSize:18,color:s.color}}>{s.val}</div>
                        <div className="stat-lbl">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Publish Timeline — SINGLE SOURCE OF TRUTH — every published item lives here */}
                  {btsLedger?.entries?.length > 0 && (
                    <div className="section">
                      <div className="sec-title">📋 Publish Timeline — All Published Content</div>
                      <div style={{fontSize:9,color:'#f59e0b',marginBottom:8,padding:'4px 10px',background:'#1a1800',border:'1px solid #2a2000',borderRadius:6}}>
                        ⚠️ This is the single source of truth. Every blog, news post, GBP post, and location page is logged here with its publish date.
                      </div>
                      <div className="card">
                        <table>
                          <thead><tr><th>Published</th><th>Type</th><th>Title</th></tr></thead>
                          <tbody>
                            {btsLedger.entries.slice().sort((a, b) => new Date(b.firstPublished) - new Date(a.firstPublished)).map((e, i) => {
                              const d = new Date(e.firstPublished)
                              const dateStr = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear()
                              const isRecent = (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
                              const tc = typeColors[e.type] || '#888'
                              return (
                                <tr key={i}>
                                  <td style={{color: isRecent ? '#f59e0b' : '#fff', fontWeight:600}}>{dateStr}{isRecent ? ' 🔥' : ''}</td>
                                  <td><span style={{fontSize:8,color:tc,fontWeight:700,textTransform:'uppercase',background:`${tc}15`,padding:'2px 6px',borderRadius:3}}>{e.type}</span></td>
                                  <td>{e.title || e.slug}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Publish Limits Reference */}
                  <div className="card" style={{marginBottom:16}}>
                    <div style={{fontSize:10,color:'#555',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>📄 Weekly Publish Limits</div>
                    {[
                      {label:'Location pages',val:btsLedger?.weeklyPageLimit||3},
                      {label:'Blog posts',val:btsLedger?.weeklyBlogLimit||3},
                      {label:'GBP posts',val:btsLedger?.weeklyGbpLimit||3},
                      {label:'News posts',val:btsLedger?.weeklyNewsLimit||1},
                    ].map((r,i) => (
                      <div key={i} style={{fontSize:10,color:'#aaa',padding:'3px 0',borderBottom:'1px solid #1a1a1a'}}>
                        <span style={{color:'#fff',fontWeight:600}}>Max {r.label}/week:</span> {r.val}
                      </div>
                    ))}
                    <div style={{fontSize:10,color:'#aaa',padding:'3px 0'}}>
                      <span style={{color:'#fff',fontWeight:600}}>Tracked by:</span> Command Centre publish ledger (timestamped, deduplicated)
                    </div>
                  </div>
                </>
              )
            })()}
          </>
        )}

        {/* TAB: GBP Posts */}
        {tab === 'gbp-posts' && (
          <>
            <GbpPosts
              posts={(snap?.btsDrafts?.drafts || []).filter(d => d.type === 'gbp' && !['signed-off', 'published'].includes(d.status))}
              label="BTS"
              actionEndpoint="/api/bts-draft-action"
            />
            {/* Live GBP posts — published and done */}
            {(() => {
              const liveGbp = (snap?.btsDrafts?.drafts || []).filter(d => d.type === 'gbp' && (d.status === 'signed-off' || d.status === 'published'))
              if (liveGbp.length === 0) return null
              return (
                <div style={{marginTop:16}}>
                  <div style={{fontSize:9,color:'#10b981',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a22',paddingBottom:4}}>
                    🟢 Live on Google Business Profile ({liveGbp.length})
                  </div>
                  <div className="card">
                    {liveGbp.map((d, i) => (
                      <div key={d.id || i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #111',fontSize:11}}>
                        <span style={{color:'#10b981',fontSize:8,fontWeight:700}}>LIVE</span>
                        <span style={{color:'#ccc',flex:1}}>{d.title}</span>
                        <span style={{fontSize:8,color:'#555'}}>{d.publishedAt ? new Date(d.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {/* TAB: Future Posts */}
        {tab === 'future-posts' && (
          <>
            {(() => {
              const allDrafts = (localDrafts || snap?.btsDrafts?.drafts || []).filter(d => !['signed-off', 'published'].includes(d.status) && d.type !== 'gbp')
              const pending = allDrafts.filter(d => ['draft', 'sunny-editing', 'approved'].includes(d.status))
              const visualCheck = allDrafts.filter(d => d.status === 'visual-check-pending')

              const statusColors = {
                'draft': '#3b82f6', 'sunny-editing': '#f59e0b', 'approved': '#10b981',
                'visual-check-pending': '#10b981', 'signed-off': '#10b981'
              }
              const statusLabels = {
                'draft': '📝 Draft', 'sunny-editing': '✏️ Sunny Editing', 'approved': '✅ Approved',
                'visual-check-pending': '✅ Ready to Sign Off', 'signed-off': '✔️ Signed Off'
              }
              const typeColors = { blog: '#3b82f6', news: '#f59e0b', gbp: '#a855f7', partnership: '#10b981' }

              async function draftAction(id, action, extraData) {
                setDraftResults(prev => ({ ...prev, [id]: { loading: true } }))
                try {
                  const res = await fetch('/api/bts-draft-action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, action, ...extraData })
                  })
                  if (res.ok) {
                    const msgs = {
                      edit: '💾 Changes saved successfully!',
                      approve: '✅ Approved! Adam has been notified.',
                      reject: '↩️ Changes requested — feedback sent.',
                      'check-desktop': '✅ Desktop check marked.',
                      'check-mobile': '✅ Mobile check marked.'
                    }
                    setDraftResults(prev => ({ ...prev, [id]: { ok: true, msg: msgs[action] || '✅ Done!' } }))
                    setLocalDrafts(prev => {
                      const list = prev || snap?.btsDrafts?.drafts || []
                      return list.map(d => {
                        if (d.id !== id) return d
                        if (action === 'approve') return { ...d, status: 'approved', approvedAt: new Date().toISOString() }
                        if (action === 'reject') return { ...d, status: 'draft', feedback: extraData?.feedback }
                        if (action === 'edit') return { ...d, editedContent: extraData?.content, editedBy: 'Sunny', status: 'sunny-editing' }
                        if (action === 'check-desktop') return { ...d, desktopChecked: true, status: d.mobileChecked ? 'signed-off' : d.status }
                        if (action === 'check-mobile') return { ...d, mobileChecked: true, status: d.desktopChecked ? 'signed-off' : d.status }
                        return d
                      })
                    })
                    setTimeout(() => setDraftResults(prev => { const n = {...prev}; delete n[id]; return n }), 4000)
                  } else {
                    const err = await res.json().catch(() => ({}))
                    setDraftResults(prev => ({ ...prev, [id]: { ok: false, msg: err.error || 'Failed — try again' } }))
                  }
                } catch (e) {
                  setDraftResults(prev => ({ ...prev, [id]: { ok: false, msg: 'Network error — try again' } }))
                }
              }

              return (
                <div>
                  {/* Summary strip */}
                  <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:100,background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'8px 14px',textAlign:'center'}}>
                      <div style={{fontSize:20,fontWeight:800,color:'#3b82f6'}}>{pending.length}</div>
                      <div style={{fontSize:8,color:'#888',textTransform:'uppercase'}}>Pending</div>
                    </div>
                    <div style={{flex:1,minWidth:100,background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'8px 14px',textAlign:'center'}}>
                      <div style={{fontSize:20,fontWeight:800,color:'#10b981'}}>{visualCheck.length}</div>
                      <div style={{fontSize:8,color:'#888',textTransform:'uppercase'}}>Ready to Sign Off</div>
                    </div>
                  </div>

                  {/* Visual Check cards — urgent, show first */}
                  {visualCheck.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:9,color:'#10b981',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600}}>✅ Ready to Sign Off</div>
                      {visualCheck.map(d => (
                        <div key={d.id} style={{background:'#0d0d10',border:'1px solid #10b98133',borderRadius:10,padding:14,marginBottom:8,borderLeft:'3px solid #10b981'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                            <span style={{fontSize:8,color:typeColors[d.type]||'#888',fontWeight:700,textTransform:'uppercase',background:`${typeColors[d.type]||'#888'}15`,padding:'2px 6px',borderRadius:4}}>{d.type}</span>
                            <span style={{fontSize:13,fontWeight:700,color:'#fff',flex:1}}>{d.title}</span>
                          </div>
                          <div style={{display:'flex',gap:12,alignItems:'center'}}>
                            <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:11,color:d.desktopChecked?'#10b981':'#888'}}>
                              <input type="checkbox" checked={d.desktopChecked} onChange={() => draftAction(d.id, 'check-desktop')}
                                style={{width:16,height:16,cursor:'pointer'}} />
                              Checked on Desktop
                            </label>
                            <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:11,color:d.mobileChecked?'#10b981':'#888'}}>
                              <input type="checkbox" checked={d.mobileChecked} onChange={() => draftAction(d.id, 'check-mobile')}
                                style={{width:16,height:16,cursor:'pointer'}} />
                              Checked on Mobile
                            </label>
                          </div>
                          {draftResults[d.id] && (
                            <div style={{fontSize:11,fontWeight:600,marginTop:6,color:draftResults[d.id].ok?'#10b981':'#ef4444'}}>{draftResults[d.id].msg}</div>
                          )}
                          <div style={{fontSize:8,color:'#555',marginTop:4}}>Published: {d.publishedAt ? new Date(d.publishedAt).toLocaleString() : '—'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pending drafts */}
                  {pending.length > 0 ? (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:9,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600}}>📝 Pending Posts ({pending.length})</div>
                      {pending.map(d => (
                        <div key={d.id} style={{background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:10,padding:14,marginBottom:10}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                            <span style={{fontSize:8,color:typeColors[d.type]||'#888',fontWeight:700,textTransform:'uppercase',background:`${typeColors[d.type]||'#888'}15`,padding:'2px 6px',borderRadius:4}}>{d.type}</span>
                            <span style={{fontSize:13,fontWeight:700,color:'#fff',flex:1}}>{d.title}</span>
                            <span style={{fontSize:9,color:statusColors[d.status],fontWeight:600}}>{statusLabels[d.status]}</span>
                          </div>
                          {d.targetDate && <div style={{fontSize:9,color:'#888',marginBottom:6}}>Target: {d.targetDate}</div>}
                          {d.feedback && <div style={{fontSize:10,color:'#ef4444',background:'#3b101033',padding:'6px 8px',borderRadius:6,marginBottom:8}}>💬 Feedback: {d.feedback}</div>}

                          {/* Content area — editable textarea */}
                          <textarea
                            defaultValue={d.editedContent || d.content}
                            id={`draft-content-${d.id}`}
                            style={{
                              width:'100%',minHeight:200,padding:12,background:'#0a0a0a',border:'1px solid #222',borderRadius:8,
                              color:'#e0e0e0',fontSize:12,fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif',lineHeight:1.6,resize:'vertical',outline:'none'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#222'}
                          />

                          {/* Action buttons */}
                          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap',alignItems:'center'}}>
                            <button
                              disabled={draftResults[d.id]?.loading}
                              onClick={() => {
                                const el = document.getElementById(`draft-content-${d.id}`)
                                if (el) draftAction(d.id, 'edit', { content: el.value })
                              }} style={{
                                padding:'8px 16px',background:'#1a1a1a',border:'1px solid #333',borderRadius:6,
                                color:'#f59e0b',fontSize:11,fontWeight:600,cursor:'pointer',
                                opacity: draftResults[d.id]?.loading ? 0.5 : 1
                              }}>💾 Save Edits</button>

                            <button
                              disabled={draftResults[d.id]?.loading}
                              onClick={async () => {
                                const el = document.getElementById(`draft-content-${d.id}`)
                                if (el) await draftAction(d.id, 'edit', { content: el.value })
                                await draftAction(d.id, 'approve')
                              }} style={{
                                padding:'8px 20px',background:'#10b981',border:'none',borderRadius:6,
                                color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',
                                opacity: draftResults[d.id]?.loading ? 0.5 : 1
                              }}>✅ Good to Go</button>

                            <button
                              disabled={draftResults[d.id]?.loading}
                              onClick={() => {
                                const fb = prompt('What needs changing?')
                                if (fb) draftAction(d.id, 'reject', { feedback: fb })
                              }} style={{
                                padding:'8px 16px',background:'#1a1a1a',border:'1px solid #ef4444',borderRadius:6,
                                color:'#ef4444',fontSize:11,fontWeight:600,cursor:'pointer',
                                opacity: draftResults[d.id]?.loading ? 0.5 : 1
                              }}>↩️ Request Changes</button>

                            {draftResults[d.id] && !draftResults[d.id].loading && (
                              <span style={{fontSize:11,fontWeight:600,color:draftResults[d.id].ok?'#10b981':'#ef4444'}}>
                                {draftResults[d.id].msg}
                              </span>
                            )}
                          </div>

                          <div style={{fontSize:8,color:'#333',marginTop:6}}>
                            By: {d.author} · Created: {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                            {d.editedBy && ` · Edited by ${d.editedBy}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:10,padding:30,textAlign:'center',marginBottom:16}}>
                      <div style={{fontSize:20,marginBottom:8}}>📮</div>
                      <div style={{color:'#555',fontSize:12}}>No pending posts — BTS agent will add drafts here for review</div>
                    </div>
                  )}

                  {/* Live content — published and signed off */}
                  {(() => {
                    const livePosts = (localDrafts || snap?.btsDrafts?.drafts || []).filter(d => (d.status === 'signed-off' || d.status === 'published') && d.type !== 'gbp')
                    if (livePosts.length === 0) return null
                    return (
                      <div style={{marginTop:8}}>
                        <div style={{fontSize:9,color:'#10b981',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a22',paddingBottom:4}}>
                          🟢 Live on Website ({livePosts.length})
                        </div>
                        <div className="card">
                          {livePosts.map((d, i) => {
                            const tc = { blog: '#a855f7', news: '#f59e0b', partnership: '#10b981' }
                            return (
                              <div key={d.id || i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #111',fontSize:11}}>
                                <span style={{fontSize:8,color:tc[d.type]||'#888',fontWeight:600,textTransform:'uppercase'}}>{d.type}</span>
                                <span style={{color:'#ccc',flex:1}}>{d.title}</span>
                                <span style={{fontSize:8,color:'#555'}}>{d.publishedAt ? new Date(d.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )
            })()}
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
                    <div className="stat-card" style={{minWidth:80}}>
                      <div className="stat-val" style={{fontSize:20,color:'#f59e0b'}}>{available.length}</div>
                      <div className="stat-lbl">Available</div>
                    </div>
                    <div className="stat-card" style={{minWidth:80}}>
                      <div className="stat-val" style={{fontSize:20,color:'#10b981'}}>{published.length}</div>
                      <div className="stat-lbl">Published</div>
                    </div>
                    <div className="stat-card" style={{minWidth:80}}>
                      <div className="stat-val" style={{fontSize:20,color:'#3b82f6'}}>{stories.length}</div>
                      <div className="stat-lbl">Total Stories</div>
                    </div>
                  </div>
                  {available.length > 0 && (
                    <div className="section">
                      <div className="sec-title">📦 Available Stories ({available.length})</div>
                      <div className="card">
                        {available.map((s, i) => (
                          <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid #1a1a1a',fontSize:11,alignItems:'center'}}>
                            <span style={{fontSize:8,color:'#f59e0b',fontWeight:600,minWidth:60,textTransform:'uppercase',background:'#2a200033',padding:'2px 6px',borderRadius:3}}>{s.type || 'story'}</span>
                            <span style={{color:'#fff',flex:1,fontWeight:500}}>{s.title}</span>
                            {s.category && <span style={{fontSize:8,color:'#888',background:'#1a1a22',padding:'2px 6px',borderRadius:3}}>{s.category}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {published.length > 0 && (
                    <div className="section">
                      <div className="sec-title">✅ Published ({published.length})</div>
                      <div className="card">
                        {published.map((s, i) => (
                          <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid #1a1a1a',fontSize:11,alignItems:'center'}}>
                            <span style={{fontSize:8,color:'#10b981',fontWeight:600,minWidth:60}}>✅ {s.type || 'story'}</span>
                            <span style={{color:'#888',flex:1}}>{s.title}</span>
                            {s.publishedAt && <span style={{fontSize:8,color:'#555'}}>{s.publishedAt}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {stories.length === 0 && (
                    <div style={{textAlign:'center',padding:30,color:'#333'}}>
                      <div style={{fontSize:24,marginBottom:8}}>📰</div>
                      <div style={{fontSize:11,color:'#555'}}>No stories in news bank yet</div>
                    </div>
                  )}
                </>
              )
            })()}
          </>
        )}

        {/* TAB: Traffic */}
        {tab === 'traffic' && (
          <>
            <div className="section">
              <div className="sec-title">📊 Page Traffic — {traffic?.period || 'Last 30 Days'}</div>
              {traffic?.totals?.views != null ? (
                <>
                  <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                    {[
                      { label: 'Page Views', val: traffic.totals.views, color: '#3b82f6' },
                      { label: 'Unique Visitors', val: traffic.totals.visitors, color: '#a855f7' },
                      { label: '📞 Phone Taps', val: traffic.totals.phoneTaps || 0, color: '#10b981' },
                      { label: '✉️ Email Taps', val: traffic.totals.emailTaps || 0, color: '#f59e0b' },
                    ].map((s, i) => (
                      <div key={i} className="stat-card" style={{minWidth:90,flex:1}}>
                        <div className="stat-val" style={{fontSize:20,color:s.color}}>{s.val?.toLocaleString()}</div>
                        <div className="stat-lbl">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {traffic.pages?.length > 0 && (
                    <div className="card">
                      <table>
                        <thead><tr><th>Page</th><th>Type</th><th>Views</th><th>📞</th><th>✉️</th></tr></thead>
                        <tbody>
                          {traffic.pages.slice(0, 15).map((p, i) => {
                            const typeColor = p.type === 'location' ? '#3b82f6' : p.type === 'blog' ? '#a855f7' : p.type === 'service' ? '#f59e0b' : '#888'
                            return (
                              <tr key={i}>
                                <td style={{color:'#fff',fontWeight:500}}>{p.path}</td>
                                <td><span style={{fontSize:8,color:typeColor,fontWeight:600,textTransform:'uppercase'}}>{p.type}</span></td>
                                <td style={{fontWeight:700}}>{p.views?.toLocaleString()}</td>
                                <td style={{color:p.phoneTaps > 0 ? '#10b981' : '#333'}}>{p.phoneTaps || 0}</td>
                                <td style={{color:p.emailTaps > 0 ? '#f59e0b' : '#333'}}>{p.emailTaps || 0}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="card" style={{textAlign:'center',padding:20}}>
                  <div style={{fontSize:20,marginBottom:6}}>📊</div>
                  <div style={{color:'#555',fontSize:11}}>Awaiting GA4 data…</div>
                  <div style={{color:'#333',fontSize:9,marginTop:4}}>GA4 not yet connected for BTS</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: Conversions */}
        {tab === 'conversions' && (
          <>
            <div className="section">
              <div className="sec-title">📞 Conversion Funnel</div>
              {traffic?.totals?.views != null ? (
                <div className="card" style={{padding:20}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,flexWrap:'wrap'}}>
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:28,fontWeight:800,color:'#a855f7'}}>{traffic.totals.visitors?.toLocaleString()}</div>
                      <div style={{fontSize:9,color:'#888',textTransform:'uppercase'}}>Visitors</div>
                    </div>
                    <div style={{fontSize:18,color:'#333',padding:'0 4px'}}>→</div>
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:28,fontWeight:800,color:'#3b82f6'}}>{traffic.totals.views?.toLocaleString()}</div>
                      <div style={{fontSize:9,color:'#888',textTransform:'uppercase'}}>Page Views</div>
                    </div>
                    <div style={{fontSize:18,color:'#333',padding:'0 4px'}}>→</div>
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:28,fontWeight:800,color:'#10b981'}}>{(traffic.totals.phoneTaps || 0) + (traffic.totals.emailTaps || 0)}</div>
                      <div style={{fontSize:9,color:'#888',textTransform:'uppercase'}}>Contact Clicks</div>
                    </div>
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
                  <div style={{color:'#555',fontSize:11}}>Conversion tracking awaiting GA4 data…</div>
                </div>
              )}
            </div>
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
