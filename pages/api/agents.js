import fs from 'fs'
import path from 'path'

const WORKSPACE = path.resolve(process.cwd(), '..')
const PIPELINE = path.join(WORKSPACE, 'dev', 'pipeline-results')

function parseLatestReport(filename) {
  try {
    const raw = fs.readFileSync(path.join(PIPELINE, filename), 'utf8')
    const lines = raw.split('\n').filter(l => l.trim())
    const title = lines[0]?.replace(/^#\s*/, '') || filename
    
    // Extract status indicators
    const pass = lines.filter(l => /✅/.test(l)).length
    const fail = lines.filter(l => /❌/.test(l)).length
    const warn = lines.filter(l => /⚠️/.test(l)).length
    
    // Get file mod time as "last updated"
    const stat = fs.statSync(path.join(PIPELINE, filename))
    
    return { title, pass, fail, warn, lastUpdated: stat.mtime.toISOString(), lines: lines.slice(1) }
  } catch {
    return null
  }
}

export default function handler(req, res) {
  try {
    const files = fs.readdirSync(PIPELINE).filter(f => f.endsWith('-latest.md'))
    
    const reports = {}
    for (const file of files) {
      const key = file.replace('-latest.md', '')
      reports[key] = parseLatestReport(file)
    }

    // Also grab full reports if requested
    if (req.query.agent) {
      const fullFile = `${req.query.agent}-full-report.md`
      const fullPath = path.join(PIPELINE, fullFile)
      if (fs.existsSync(fullPath)) {
        reports[req.query.agent].fullReport = fs.readFileSync(fullPath, 'utf8')
      }
    }

    res.json({ reports, count: Object.keys(reports).length })
  } catch (e) {
    res.status(500).json({ error: 'Failed to read agent reports', detail: e.message })
  }
}
