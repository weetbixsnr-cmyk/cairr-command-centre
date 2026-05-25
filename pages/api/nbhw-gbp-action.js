/**
 * /api/nbhw-gbp-action - update NBHW GBP posts in public/data/nbhw-status.json.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'nbhw-status.json')

import { isNbhwAuthed, canWriteJson } from '../../lib/auth'

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { gbpPosts: { posts: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isNbhwAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })
  if (!canWriteJson()) return res.status(503).json({ error: 'JSON writes disabled in this environment' })

  const { id, action, content, feedback } = req.body
  if (!id || !action) return res.status(400).json({ error: 'id and action required' })

  const data = readStatus()
  data.gbpPosts = data.gbpPosts || { posts: [] }
  const post = data.gbpPosts.posts.find(p => p.id === id)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const now = new Date().toISOString()
  switch (action) {
    case 'edit':
      post.editedContent = content || post.editedContent
      post.editedBy = 'Adam'
      post.status = 'editing'
      break
    case 'approve':
      post.status = 'approved'
      post.approvedAt = now
      break
    case 'publish':
      post.status = 'published'
      post.publishedAt = now
      break
    case 'sign-off':
      post.status = 'signed-off'
      post.signedOffAt = now
      break
    case 'reject':
      post.status = 'draft'
      post.feedback = feedback || 'Changes requested'
      break
    default:
      return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  post.updatedAt = now
  data.lastUpdated = now
  writeStatus(data)
  return res.json({ ok: true, post })
}
