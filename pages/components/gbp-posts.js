/**
 * GBP Posts component — shared between NBHW and BTS SEO pages
 * Displays Google Business Profile posts with status pipeline + actions
 */
import { useState } from 'react'

export default function GbpPosts({ posts = [], label = 'GBP', actionEndpoint }) {
  const [actionLoading, setActionLoading] = useState(null)
  const [localPosts, setLocalPosts] = useState(null)

  const allPosts = localPosts || posts

  async function doAction(id, action, extraData = {}) {
    if (!actionEndpoint) return
    setActionLoading(`${id}-${action}`)
    try {
      const res = await fetch(actionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extraData })
      })
      if (res.ok) {
        const data = await res.json()
        // Optimistic update
        setLocalPosts(prev => {
          const list = prev || posts
          return list.map(p => {
            if (p.id !== id) return p
            switch (action) {
              case 'approve':
                return { ...p, status: 'approved', approvedAt: new Date().toISOString() }
              case 'reject':
                return { ...p, status: 'draft', feedback: extraData.feedback }
              case 'edit':
                return { ...p, editedContent: extraData.content, editedBy: 'Dashboard' }
              case 'publish':
                return { ...p, status: 'published', publishedAt: new Date().toISOString() }
              case 'sign-off':
                return { ...p, status: 'signed-off', signedOffAt: new Date().toISOString() }
              default:
                return p
            }
          })
        })
      }
    } catch {}
    setActionLoading(null)
  }

  if (!allPosts || allPosts.length === 0) {
    return (
      <div style={{textAlign:'center',padding:40,color:'#333'}}>
        <div style={{fontSize:32,marginBottom:8}}>📍</div>
        <div style={{fontSize:13,color:'#555'}}>No GBP posts yet</div>
        <div style={{fontSize:10,color:'#333',marginTop:4}}>Posts will appear here when {label} status data is updated</div>
      </div>
    )
  }

  const published = allPosts.filter(p => p.status === 'published' || p.status === 'signed-off')
  const drafts = allPosts.filter(p => p.status === 'draft' || p.status === 'editing' || p.status === 'sunny-editing')
  const approved = allPosts.filter(p => p.status === 'approved')
  const readyToSignOff = allPosts.filter(p => p.status === 'visual-check-pending')

  const statusColor = {
    'draft': '#3b82f6',
    'editing': '#f59e0b',
    'sunny-editing': '#f59e0b',
    'approved': '#10b981',
    'visual-check-pending': '#10b981',
    'published': '#10b981',
    'signed-off': '#10b981'
  }
  const statusIcon = {
    'draft': '📝',
    'editing': '✏️',
    'sunny-editing': '✏️',
    'approved': '✅',
    'visual-check-pending': '✅',
    'published': '🟢',
    'signed-off': '🏁'
  }

  function PostCard({ post }) {
    const color = statusColor[post.status] || '#888'
    const icon = statusIcon[post.status] || '📄'
    const isScheduled = post.targetDate && new Date(post.targetDate) > new Date()
    const canApprove = ['draft', 'editing', 'sunny-editing'].includes(post.status)
    const canPublish = post.status === 'approved'
    const canSignOff = post.status === 'published'
    const canEdit = ['draft', 'editing', 'sunny-editing'].includes(post.status)
    const hasActions = actionEndpoint && (canApprove || canPublish || canSignOff)

    return (
      <div style={{
        background:'#111',
        border:'1px solid #222',
        borderRadius:10,
        padding:14,
        marginBottom:10,
        borderLeft:`3px solid ${color}`
      }}>
        {/* Header row */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
          <span style={{
            fontSize:8,padding:'2px 8px',borderRadius:4,fontWeight:600,
            background:`${color}20`,color
          }}>
            {icon} {post.status?.toUpperCase().replace('-', ' ')}
          </span>
          {post.targetDate && (
            <span style={{
              fontSize:8,padding:'2px 8px',borderRadius:4,
              background: isScheduled ? '#2a200033' : '#0a2a1a33',
              color: isScheduled ? '#f59e0b' : '#10b981',
              fontWeight:600
            }}>
              {isScheduled ? '📅 ' : '✅ '}{post.targetDate}
            </span>
          )}
          <span style={{flex:1}} />
          {post.source && (
            <span style={{fontSize:8,color:'#555',fontFamily:'monospace'}}>{post.source}</span>
          )}
        </div>

        {/* Title */}
        <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:8}}>
          {post.title}
        </div>

        {/* Feedback banner */}
        {post.feedback && (
          <div style={{fontSize:10,color:'#ef4444',background:'#3b101033',padding:'6px 10px',borderRadius:6,marginBottom:8,border:'1px solid #ef444433'}}>
            💬 Feedback: {post.feedback}
          </div>
        )}

        {/* Content — editable for drafts, read-only otherwise */}
        {canEdit && actionEndpoint ? (
          <textarea
            defaultValue={post.editedContent || post.content}
            id={`gbp-content-${post.id}`}
            style={{
              width:'100%',minHeight:160,padding:12,background:'#0a0a0a',border:'1px solid #222',borderRadius:8,
              color:'#e0e0e0',fontSize:12,fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif',lineHeight:1.6,resize:'vertical',outline:'none'
            }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = '#222'}
          />
        ) : (
          <div style={{
            background:'#0a0a0d',
            border:'1px solid #1a1a22',
            borderRadius:8,
            padding:12,
            maxHeight:180,
            overflowY:'auto',
            fontSize:11,
            color:'#ccc',
            lineHeight:1.6,
            whiteSpace:'pre-wrap'
          }}>
            {post.editedContent || post.content}
          </div>
        )}

        {/* Action buttons */}
        {hasActions && (
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
            {canEdit && (
              <button
                disabled={actionLoading === `${post.id}-edit`}
                onClick={() => {
                  const el = document.getElementById(`gbp-content-${post.id}`)
                  if (el) doAction(post.id, 'edit', { content: el.value })
                }}
                style={{
                  padding:'8px 16px',background:'#1a1a1a',border:'1px solid #333',borderRadius:6,
                  color:'#f59e0b',fontSize:11,fontWeight:600,cursor:'pointer',
                  opacity: actionLoading === `${post.id}-edit` ? 0.5 : 1
                }}
              >
                💾 Save Edits
              </button>
            )}
            {canApprove && (
              <button
                disabled={actionLoading === `${post.id}-approve`}
                onClick={() => {
                  const el = document.getElementById(`gbp-content-${post.id}`)
                  doAction(post.id, 'approve', el ? { content: el.value } : {})
                }}
                style={{
                  padding:'8px 20px',background:'#10b981',border:'none',borderRadius:6,
                  color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',
                  opacity: actionLoading === `${post.id}-approve` ? 0.5 : 1
                }}
              >
                ✅ Good to Go
              </button>
            )}
            {canApprove && (
              <button
                disabled={actionLoading === `${post.id}-reject`}
                onClick={() => {
                  const fb = prompt('What needs changing?')
                  if (fb) doAction(post.id, 'reject', { feedback: fb })
                }}
                style={{
                  padding:'8px 16px',background:'#1a1a1a',border:'1px solid #ef4444',borderRadius:6,
                  color:'#ef4444',fontSize:11,fontWeight:600,cursor:'pointer',
                  opacity: actionLoading === `${post.id}-reject` ? 0.5 : 1
                }}
              >
                ↩️ Request Changes
              </button>
            )}
            {canPublish && (
              <button
                disabled={actionLoading === `${post.id}-publish`}
                onClick={() => doAction(post.id, 'publish')}
                style={{
                  padding:'8px 20px',background:'#3b82f6',border:'none',borderRadius:6,
                  color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',
                  opacity: actionLoading === `${post.id}-publish` ? 0.5 : 1
                }}
              >
                🚀 Mark Published
              </button>
            )}
            {canSignOff && (
              <button
                disabled={actionLoading === `${post.id}-sign-off`}
                onClick={() => doAction(post.id, 'sign-off')}
                style={{
                  padding:'8px 20px',background:'#a855f7',border:'none',borderRadius:6,
                  color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',
                  opacity: actionLoading === `${post.id}-sign-off` ? 0.5 : 1
                }}
              >
                🏁 Sign Off
              </button>
            )}
          </div>
        )}

        {/* Metadata row */}
        <div style={{display:'flex',gap:12,marginTop:8,fontSize:8,color:'#444',flexWrap:'wrap'}}>
          {post.author && <span>By {post.author}</span>}
          {post.createdAt && <span>Created: {new Date(post.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
          {post.publishedAt && <span>Published: {new Date(post.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
          {post.signedOffAt && <span>Signed off: {new Date(post.signedOffAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
          {post.editedBy && <span>Edited by {post.editedBy}</span>}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Summary strip */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {readyToSignOff.length > 0 && (
          <div style={{flex:1,minWidth:80,background:'#0d0d10',border:'1px solid #10b98133',borderRadius:8,padding:'6px 14px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:800,color:'#10b981'}}>{readyToSignOff.length}</div>
            <div style={{fontSize:8,color:'#888',textTransform:'uppercase'}}>Ready to Sign Off</div>
          </div>
        )}
        <div style={{flex:1,minWidth:80,background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'6px 14px',textAlign:'center'}}>
          <div style={{fontSize:20,fontWeight:800,color:'#3b82f6'}}>{drafts.length}</div>
          <div style={{fontSize:8,color:'#888',textTransform:'uppercase'}}>Drafts</div>
        </div>
        <div style={{flex:1,minWidth:80,background:'#0d0d10',border:'1px solid #1a1a22',borderRadius:8,padding:'6px 14px',textAlign:'center'}}>
          <div style={{fontSize:20,fontWeight:800,color:'#10b981'}}>{published.length}</div>
          <div style={{fontSize:8,color:'#888',textTransform:'uppercase'}}>Published</div>
        </div>
      </div>

      {/* Schedule timeline */}
      {allPosts.some(p => p.targetDate) && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
            📅 Schedule
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {allPosts.filter(p => p.targetDate).sort((a,b) => new Date(a.targetDate) - new Date(b.targetDate)).map((p, i) => {
              const isPast = new Date(p.targetDate) <= new Date()
              const isPublished = p.status === 'published' || p.status === 'signed-off'
              const bg = isPublished ? '#0a2a1a' : isPast ? '#2a200033' : '#111'
              const border = isPublished ? '#10b981' : isPast ? '#f59e0b' : '#222'
              const icon = isPublished ? '🟢' : isPast ? '⏰' : '📅'
              return (
                <div key={i} style={{
                  background:bg,border:`1px solid ${border}`,borderRadius:8,padding:'8px 12px',
                  minWidth:140,flex:'0 0 auto'
                }}>
                  <div style={{fontSize:9,color:isPublished?'#10b981':'#888',fontWeight:600}}>{icon} {p.targetDate}</div>
                  <div style={{fontSize:11,color:'#fff',fontWeight:600,marginTop:2}}>{p.title}</div>
                  <div style={{fontSize:8,color:statusColor[p.status]||'#555',marginTop:2}}>{statusIcon[p.status]} {p.status}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ready to Sign Off section */}
      {readyToSignOff.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'#10b981',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
            ✅ Ready to Sign Off ({readyToSignOff.length})
          </div>
          {readyToSignOff.map(p => (
            <div key={p.id} style={{background:'#0d0d10',border:'1px solid #10b98133',borderRadius:10,padding:14,marginBottom:10,borderLeft:'3px solid #10b981'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:8,padding:'2px 8px',borderRadius:4,fontWeight:600,background:'#10b98120',color:'#10b981'}}>✅ READY TO SIGN OFF</span>
                <span style={{flex:1}} />
                {p.publishedAt && <span style={{fontSize:8,color:'#555'}}>Published: {new Date(p.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:8}}>{p.title}</div>
              {(p.editedContent || p.content) && (
                <div style={{background:'#0a0a0d',border:'1px solid #1a1a22',borderRadius:8,padding:12,maxHeight:180,overflowY:'auto',fontSize:11,color:'#ccc',lineHeight:1.6,whiteSpace:'pre-wrap',marginBottom:8}}>
                  {p.editedContent || p.content}
                </div>
              )}
              {actionEndpoint && (
                <button
                  disabled={actionLoading === `${p.id}-sign-off`}
                  onClick={() => doAction(p.id, 'sign-off')}
                  style={{padding:'8px 20px',background:'#10b981',border:'none',borderRadius:6,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',opacity:actionLoading===`${p.id}-sign-off`?0.5:1}}
                >
                  🏁 Sign Off
                </button>
              )}
              <div style={{display:'flex',gap:12,marginTop:8,fontSize:8,color:'#444',flexWrap:'wrap'}}>
                {p.author && <span>By {p.author}</span>}
                {p.createdAt && <span>Created: {new Date(p.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drafts section */}
      {drafts.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
            📝 Drafts — Review &amp; Approve ({drafts.length})
          </div>
          {drafts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
            ✅ Approved — Ready to Post ({approved.length})
          </div>
          {approved.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {/* Published */}
      {published.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'#aaa',textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,fontWeight:600,borderBottom:'1px solid #1a1a1a',paddingBottom:4}}>
            🟢 Published ({published.length})
          </div>
          {published.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {/* GBP Safety reminder */}
      <div style={{
        background:'#111',border:'1px solid #222',borderRadius:8,padding:12,
        fontSize:9,color:'#555',textAlign:'center',marginTop:8
      }}>
        📍 GBP posting limits: 2-3 posts/week · Avoid bulk uploads · No keyword stuffing
      </div>
    </>
  )
}
