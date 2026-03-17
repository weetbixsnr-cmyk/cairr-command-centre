/**
 * /api/action — Read/update action queue items
 * GET: returns all items
 * POST: { id, action } — updates item (approve/reject/complete/snooze)
 */

import fs from 'fs'
import path from 'path'

const QUEUE_PATH = path.resolve(process.cwd(), '..', 'dev', 'dashboard', 'action-queue.json')
const SNAPSHOT_PATH = path.resolve(process.cwd(), 'public', 'snapshot.json')

function readQueue() {
  try {
    return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
  } catch {
    try {
      const snap = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'))
      return snap.actionQueue?.items || []
    } catch {
      return []
    }
  }
}

function writeQueue(items) {
  try {
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(items, null, 2))
    return true
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ items: readQueue() })
  }

  if (req.method === 'POST') {
    const { id, action } = req.body
    if (!id || !action) return res.status(400).json({ error: 'id and action required' })

    const validActions = ['approve', 'reject', 'complete', 'snooze']
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` })
    }

    try {
      const items = readQueue()
      const item = items.find(i => i.id === id)
      if (!item) return res.status(404).json({ error: 'Item not found' })

      const now = new Date().toISOString()
      
      if (action === 'approve') {
        item.status = 'approved'
        item.updatedAt = now
      } else if (action === 'reject') {
        item.status = 'rejected'
        item.updatedAt = now
      } else if (action === 'complete') {
        item.status = 'completed'
        item.updatedAt = now
      } else if (action === 'snooze') {
        // Push due date by 24h
        const newDue = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
        item.due = newDue
        item.snoozedAt = now
        item.overdue = false
      }

      const wrote = writeQueue(items)
      return res.json({ success: true, item, persisted: wrote })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
