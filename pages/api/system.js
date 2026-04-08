import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const WORKSPACE = path.resolve(process.cwd(), '..')
const PIPELINE = path.join(WORKSPACE, 'dev', 'pipeline-results')

export default function handler(req, res) {
  try {
    // Read infra status if available
    let infra = null
    const infraPath = path.join(PIPELINE, 'infra-status-latest.md')
    if (fs.existsSync(infraPath)) {
      const raw = fs.readFileSync(infraPath, 'utf8')
      const lines = raw.split('\n').filter(l => l.trim())
      infra = {
        title: lines[0]?.replace(/^#\s*/, ''),
        items: lines.slice(1).map(l => {
          const match = l.match(/^(✅|❌|⚠️)\s+(.*)/)
          return match ? { status: match[1] === '✅' ? 'ok' : match[1] === '⚠️' ? 'warn' : 'fail', text: match[2] } : null
        }).filter(Boolean)
      }
    }

    // Try to get basic openclaw info
    let gateway = null
    try {
      const out = execSync('openclaw status 2>&1', { timeout: 10000, encoding: 'utf8' })
      
      // Parse key fields
      const getField = (label) => {
        const match = out.match(new RegExp(`│\\s*${label}\\s*│\\s*(.+?)\\s*│`, 'i'))
        return match ? match[1].trim() : null
      }
      
      gateway = {
        status: 'running',
        sessions: getField('Sessions'),
        agents: getField('Agents'),
        heartbeat: getField('Heartbeat'),
        channels: []
      }
      
      // Parse channel status
      const whatsappMatch = out.match(/WhatsApp\s*│\s*ON\s*│\s*(\w+)/)
      const discordMatch = out.match(/Discord\s*│\s*ON\s*│\s*(\w+)/)
      if (whatsappMatch) gateway.channels.push({ name: 'WhatsApp', state: whatsappMatch[1] })
      if (discordMatch) gateway.channels.push({ name: 'Discord', state: discordMatch[1] })
    } catch {
      gateway = { status: 'unknown', error: 'Could not reach openclaw CLI' }
    }

    res.json({ infra, gateway, timestamp: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: 'System status failed', detail: e.message })
  }
}
