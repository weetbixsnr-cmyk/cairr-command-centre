/**
 * /api/action - update dashboard-local manual action queue.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'dashboard-status.json')

function readDashboardStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'))
  } catch {
    return { actionQueue: { items: [] } }
  }
}

function writeDashboardStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = readDashboardStatus()
    return res.json({ items: data.actionQueue?.items || [] })
  }

  if (req.method === 'POST') {
    const { id, action } = req.body
    if (!id || !action) return res.status(400).json({ error: 'id and action required' })

    const validActions = ['approve', 'reject', 'complete', 'snooze']
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` })
    }

    try {
      const data = readDashboardStatus()
      const items = data.actionQueue?.items || []
      const item = items.find(i => i.id === id)
      if (!item) return res.status(404).json({ error: 'Item not found' })

      const now = new Date().toISOString()
      if (action === 'snooze') {
        item.due_date = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
        item.snoozedAt = now
      } else {
        item.status = action === 'complete' ? 'completed' : action
        item.updatedAt = now
      }
      data.lastUpdated = now
      writeDashboardStatus(data)
      return res.json({ success: true, item, persisted: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
