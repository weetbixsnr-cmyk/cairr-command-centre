import fs from 'fs'
import path from 'path'

const WORKSPACE = path.resolve(process.cwd(), '..')
const PIPELINE = path.join(WORKSPACE, 'dev', 'pipeline-results')

export default function handler(req, res) {
  try {
    const raw = fs.readFileSync(path.join(PIPELINE, 'fleet-health-latest.md'), 'utf8')
    const lines = raw.split('\n').filter(l => l.trim())
    const title = lines[0]?.replace(/^#\s*/, '') || 'Fleet Health'
    
    const agents = []
    let i = 1
    while (i < lines.length) {
      const line = lines[i]
      const match = line.match(/^(✅|❌)\s+(\S+):?\s*(.*)/)
      if (match) {
        const agent = { name: match[2].replace(/:$/, ''), healthy: match[1] === '✅', notes: [] }
        if (match[3]) agent.notes.push(match[3])
        // Check for indented notes on following lines
        while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
          i++
          agent.notes.push(lines[i].trim())
        }
        agents.push(agent)
      }
      i++
    }

    const healthy = agents.filter(a => a.healthy).length
    const total = agents.length
    const pct = total > 0 ? Math.round((healthy / total) * 100) : 0

    res.json({ title, agents, healthy, total, pct })
  } catch (e) {
    res.status(500).json({ error: 'Failed to read fleet health', detail: e.message })
  }
}
