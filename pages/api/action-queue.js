import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'dashboard-status.json')

export default function handler(req, res) {
  try {
    const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'))
    const items = status.actionQueue?.items || []
    const now = new Date()
    const enriched = items.map(item => ({
      ...item,
      overdue: item.due_date && new Date(item.due_date) < now && item.status === 'pending'
    }))
    const pending = enriched.filter(i => i.status === 'pending')
    res.json({
      items: enriched,
      pending: pending.length,
      overdueCount: pending.filter(i => i.overdue).length,
      highPriority: pending.filter(i => i.priority === 'high').length
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to read dashboard action queue', detail: e.message })
  }
}
