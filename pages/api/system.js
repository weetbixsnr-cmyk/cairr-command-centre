import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'dashboard-status.json')

export default function handler(req, res) {
  try {
    const dashboard = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'))
    res.json({
      dashboard,
      gateway: {
        status: 'parked',
        error: null,
        note: 'OpenClaw CLI status is not read by the de-agented dashboard.'
      },
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    res.status(500).json({ error: 'System status failed', detail: e.message })
  }
}
