/**
 * /api/nbhw-gbp-action — Actions on NBHW GBP posts
 * POST { id, action, content?, feedback? }
 * Actions: edit, approve, publish, sign-off, reject
 */

import fs from 'fs'

const POSTS_FILE = '/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/nbhw-gmb-posts.json'

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === process.env.NBHW_DRAFT_API_KEY) return true
  return false
}

function readPosts() {
  try { return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8')) } catch { return { posts: [] } }
}

function writePosts(data) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  const { id, action, content, feedback } = req.body
  if (!id || !action) return res.status(400).json({ error: 'id and action required' })

  const data = readPosts()
  const post = data.posts.find(p => p.id === id)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const now = new Date().toISOString()

  switch (action) {
    case 'edit':
      post.editedContent = content || post.editedContent
      post.editedBy = 'Adam'
      post.status = 'editing'
      post.updatedAt = now
      break
    case 'approve':
      post.status = 'approved'
      post.approvedAt = now
      post.updatedAt = now
      break
    case 'publish':
      post.status = 'published'
      post.publishedAt = now
      post.updatedAt = now
      break
    case 'sign-off':
      post.status = 'signed-off'
      post.signedOffAt = now
      post.updatedAt = now
      break
    case 'reject':
      post.status = 'draft'
      post.feedback = feedback || 'Changes requested'
      post.updatedAt = now
      break
    default:
      return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  writePosts(data)
  return res.json({ ok: true, post })
}
