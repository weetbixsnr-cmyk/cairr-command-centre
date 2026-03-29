/**
 * Reusable SEO Dashboard component — standardised 8-section format
 * Used by both NBHW and BTS SEO pages
 * Renders from parsed SEO-DASHBOARD.md sections + news-bank.json
 */

function SectionCard({ title, children, icon }) {
  return (
    <div style={{background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
        {icon} {title}
      </div>
      {children}
    </div>
  )
}

function MdLines({ lines, maxLines }) {
  const display = maxLines ? lines.slice(0, maxLines) : lines
  return (
    <div>
      {display.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        // Table rows
        if (trimmed.startsWith('|') && !trimmed.startsWith('|--') && !trimmed.startsWith('| -')) {
          const cells = trimmed.split('|').filter(Boolean).map(c => c.trim())
          const isHeader = i === 0 || (display[i+1] && display[i+1].trim().startsWith('|--'))
          return (
            <div key={i} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid #111',fontSize:10}}>
              {cells.map((cell, j) => (
                <span key={j} style={{flex:1,color:isHeader?'#888':'#ccc',fontWeight:isHeader?600:400,fontSize:isHeader?9:10,textTransform:isHeader?'uppercase':undefined}}>
                  {cell.replace(/\*\*/g, '')}
                </span>
              ))}
            </div>
          )
        }
        // Skip table dividers
        if (/^\|[\s-|]+\|$/.test(trimmed)) return null
        // Checkboxes
        if (trimmed.startsWith('- [x]')) return (
          <div key={i} style={{fontSize:10,color:'#10b981',padding:'2px 0'}}>✅ {trimmed.replace(/^- \[x\]\s*/, '').replace(/\*\*/g, '')}</div>
        )
        if (trimmed.startsWith('- [ ]')) return (
          <div key={i} style={{fontSize:10,color:'#888',padding:'2px 0'}}>⬜ {trimmed.replace(/^- \[\s?\]\s*/, '').replace(/\*\*/g, '')}</div>
        )
        // Severity items
        if (trimmed.startsWith('🔴') || trimmed.startsWith('🟠') || trimmed.startsWith('🟡') || trimmed.startsWith('🟢')) {
          const sevColor = trimmed.startsWith('🔴') ? '#ef4444' : trimmed.startsWith('🟠') ? '#f59e0b' : trimmed.startsWith('🟡') ? '#3b82f6' : '#10b981'
          return <div key={i} style={{fontSize:10,color:sevColor,padding:'2px 0',fontWeight:500}}>{trimmed.replace(/\*\*/g, '')}</div>
        }
        // List items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return (
          <div key={i} style={{fontSize:10,color:'#aaa',padding:'2px 0',paddingLeft:8}}>• {trimmed.replace(/^[-*]\s*/, '').replace(/\*\*/g, '')}</div>
        )
        // Numbered items
        if (/^\d+\./.test(trimmed)) return (
          <div key={i} style={{fontSize:10,color:'#aaa',padding:'2px 0',paddingLeft:8}}>{trimmed.replace(/\*\*/g, '')}</div>
        )
        // Bold lines as sub-headers
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) return (
          <div key={i} style={{fontSize:10,color:'#fff',fontWeight:700,padding:'4px 0 2px'}}>{trimmed.replace(/\*\*/g, '')}</div>
        )
        // Regular text
        return <div key={i} style={{fontSize:10,color:'#aaa',padding:'1px 0'}}>{trimmed.replace(/\*\*/g, '')}</div>
      })}
      {maxLines && lines.length > maxLines && (
        <div style={{fontSize:9,color:'#555',marginTop:4}}>+{lines.length - maxLines} more lines</div>
      )}
    </div>
  )
}

function NewsBank({ newsBank }) {
  if (!newsBank?.stories?.length) return <div style={{color:'#555',fontSize:11,fontStyle:'italic'}}>No stories in bank yet</div>
  const published = newsBank.stories.filter(s => s.status === 'published')
  const available = newsBank.stories.filter(s => s.status !== 'published')
  return (
    <div>
      {available.length > 0 && (
        <div style={{marginBottom:8}}>
          <div style={{fontSize:9,color:'#f59e0b',fontWeight:600,marginBottom:4}}>📦 Available ({available.length})</div>
          {available.map((s, i) => (
            <div key={i} style={{display:'flex',gap:8,padding:'4px 0',borderBottom:'1px solid #111',fontSize:10,alignItems:'center'}}>
              <span style={{fontSize:8,color:'#f59e0b',fontWeight:600,minWidth:55,textTransform:'uppercase'}}>{s.type || 'story'}</span>
              <span style={{color:'#fff',flex:1,fontWeight:500}}>{s.title}</span>
              {s.service && <span style={{fontSize:8,color:'#888'}}>{s.service}</span>}
            </div>
          ))}
        </div>
      )}
      {published.length > 0 && (
        <div>
          <div style={{fontSize:9,color:'#10b981',fontWeight:600,marginBottom:4}}>✅ Published ({published.length})</div>
          {published.map((s, i) => (
            <div key={i} style={{display:'flex',gap:8,padding:'4px 0',borderBottom:'1px solid #111',fontSize:10,alignItems:'center'}}>
              <span style={{fontSize:8,color:'#10b981',fontWeight:600,minWidth:55}}>✅ {s.type || 'story'}</span>
              <span style={{color:'#888',flex:1}}>{s.title}</span>
              {s.publishedAt && <span style={{fontSize:8,color:'#555'}}>{s.publishedAt}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SeoDashboard({ seoDash, publishLedger, label }) {
  if (!seoDash) return (
    <div style={{textAlign:'center',padding:30,color:'#333'}}>
      <div style={{fontSize:20,marginBottom:8}}>📊</div>
      Waiting for {label || 'SEO'} dashboard data…<br/>
      <span style={{fontSize:9}}>Agent will write SEO-DASHBOARD.md when ready</span>
    </div>
  )

  const s = seoDash.sections || {}

  // Section mapping to the 8 standardised sections
  const sectionMap = [
    { key: 'plan-overview', icon: '📋', fallbacks: ['plan', 'overview', 'score', 'progress', 'plan-status'] },
    { key: 'critical-fixes', icon: '🔴', fallbacks: ['critical', 'fixes', 'outstanding', 'blockers'] },
    { key: 'publish-history', icon: '📅', fallbacks: ['publish', 'history', 'published', 'content-published'] },
    { key: 'content-pipeline', icon: '🔮', fallbacks: ['pipeline', 'content-plan', 'next-4-weeks', 'upcoming', 'content-pipeline'] },
    { key: 'coverage-matrix', icon: '📍', fallbacks: ['coverage', 'matrix', 'services-locations', 'service-suburb', 'service-location'] },
    { key: 'news-bank', icon: '📰', fallbacks: ['news', 'stories', 'news-bank'] },
    { key: 'competitor-watch', icon: '🏆', fallbacks: ['competitor', 'competitors', 'watch'] },
    { key: 'weekly-audit-log', icon: '📝', fallbacks: ['audit-log', 'weekly-audit', 'monday'] },
  ]

  function findSection(map) {
    if (s[map.key]) return s[map.key]
    for (const fb of map.fallbacks) {
      const found = Object.entries(s).find(([k]) => k.includes(fb))
      if (found) return found[1]
    }
    return null
  }

  // Publish safety strip
  const weeklySlots = { blogs: 3, gbp: 3, news: 1 }

  return (
    <div>
      {/* Publish Safety Strip */}
      {publishLedger && (
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          {[
            { label: 'Blogs/wk', used: publishLedger.last7d?.blogs || 0, max: weeklySlots.blogs },
            { label: 'Pages/wk', used: publishLedger.last7d?.pages || 0, max: publishLedger.weeklyPageLimit || 3 },
          ].map((slot, i) => {
            const pct = (slot.used / slot.max) * 100
            const c = pct >= 100 ? '#ef4444' : pct >= 66 ? '#f59e0b' : '#10b981'
            return (
              <div key={i} style={{flex:1,minWidth:120,background:'#0d0d10',border:`1px solid ${c}33`,borderRadius:8,padding:'8px 14px',borderLeft:`3px solid ${c}`}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:18,fontWeight:800,color:c}}>{slot.used}/{slot.max}</span>
                  <span style={{fontSize:9,color:'#888'}}>{slot.label}</span>
                </div>
                <div style={{height:4,background:'#1a1a1a',borderRadius:2,marginTop:4,overflow:'hidden'}}>
                  <div style={{height:4,width:`${Math.min(100, pct)}%`,background:c,borderRadius:2}}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 8 Sections */}
      {sectionMap.map((map, i) => {
        // News bank has its own dedicated tab — skip here to avoid double-up
        if (map.key === 'news-bank') return null

        const section = findSection(map)
        if (!section) return null

        return (
          <SectionCard key={i} title={section.title} icon={map.icon}>
            <MdLines lines={section.lines} maxLines={30} />
          </SectionCard>
        )
      })}

      {/* Source info */}
      <div style={{fontSize:8,color:'#222',textAlign:'right',marginTop:8}}>
        SEO-DASHBOARD.md · Updated: {seoDash.lastUpdated ? new Date(seoDash.lastUpdated).toLocaleString() : '—'}
      </div>
    </div>
  )
}
