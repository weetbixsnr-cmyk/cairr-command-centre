/**
 * /api/action — Approve, reject, or complete action queue items
 * POST /api/action { id, action: 'approve'|'reject'|'complete', note? }
 * 
 * In production: pushes update to KV
 * Locally: updates action-queue.json directly
 */

import fs from 'fs'
import path from 'path'

const WORKSPACE = path.resolve(process.cwd(), '..')
const QUEUE_FILE = path.join(WORKSPACE, 'dev', 'dashboard', 'action-queue.json')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  try {
    const { id, action, note } = req.body

    if (!id || !action) {
      return res.status(400).json({ error: 'Missing id or action' })
    }

    if (!['approve', 'reject', 'complete', 'snooze'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use: approve, reject, complete, snooze' })
    }

    // Read current queue
    const raw = fs.readFileSync(QUEUE_FILE, 'utf8')
    const items = JSON.parse(raw)

    // Find and update item
    const item = items.find(i => i.id === id)
    if (!item) {
      return res.status(404).json({ error: `Item ${id} not found` })
    }

    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'complete': 'completed',
      'snooze': 'pending', // keeps pending but bumps date
    }

    item.status = statusMap[action]
    item.actionTaken = action
    item.actionDate = new Date().toISOString()
    if (note) item.note = note
    if (action === 'snooze') {
      // Snooze by 24 hours
      const newDue = new Date()
      newDue.setDate(newDue.getDate() + 1)
      item.due_date = newDue.toISOString().split('T')[0]
      item.note = (item.note || '') + ` [Snoozed ${new Date().toISOString().split('T')[0]}]`
    }

    // Write back
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(items, null, 2))

    res.json({ success: true, item })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update action queue', detail: e.message })
  }
}
