import fs from 'fs'
import path from 'path'

const WORKSPACE = path.resolve(process.cwd(), '..')
const PIPELINE = path.join(WORKSPACE, 'dev', 'pipeline-results')

export default function handler(req, res) {
  try {
    const raw = fs.readFileSync(path.join(PIPELINE, 'governance-drift-latest.md'), 'utf8')
    const lines = raw.split('\n').filter(l => l.trim())
    const title = lines[0]?.replace(/^#\s*/, '') || 'Governance Drift'

    const agents = []
    for (const line of lines.slice(1)) {
      const match = line.match(/^(✅|❌|⚠️)\s+(\S+):?\s*(.*)/)
      if (match) {
        agents.push({
          name: match[2].replace(/:$/, ''),
          status: match[1] === '✅' ? 'ok' : match[1] === '⚠️' ? 'warn' : 'fail',
          detail: match[3] || ''
        })
      }
    }

    const ok = agents.filter(a => a.status === 'ok').length
    const total = agents.length

    res.json({ title, agents, ok, total })
  } catch (e) {
    res.status(500).json({ error: 'Failed to read governance', detail: e.message })
  }
}
