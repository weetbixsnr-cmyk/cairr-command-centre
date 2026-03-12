import fs from 'fs'
import path from 'path'

const WORKSPACE = path.resolve(process.cwd(), '..')
const DASHBOARD_DATA = path.join(WORKSPACE, 'dev', 'dashboard')

export default function handler(req, res) {
  try {
    const raw = fs.readFileSync(path.join(DASHBOARD_DATA, 'action-queue.json'), 'utf8')
    const items = JSON.parse(raw)

    const now = new Date()
    const enriched = items.map(item => {
      const overdue = item.due_date && new Date(item.due_date) < now && item.status === 'pending'
      return { ...item, overdue }
    })

    const pending = enriched.filter(i => i.status === 'pending')
    const overdueCount = pending.filter(i => i.overdue).length
    const highPriority = pending.filter(i => i.priority === 'high')

    res.json({
      items: enriched,
      pending: pending.length,
      overdueCount,
      highPriority: highPriority.length
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to read action queue', detail: e.message })
  }
}
