import { execSync } from 'child_process'

export default function handler(req, res) {
  try {
    let cronData = { jobs: [], total: 0, active: 0, errors: 0 }

    // Try openclaw cron list
    try {
      const out = execSync('openclaw cron list 2>&1', { timeout: 10000, encoding: 'utf8' })
      const lines = out.split('\n').filter(l => l.trim())

      // Parse table rows — format varies, try to extract key fields
      for (const line of lines) {
        const cols = line.split('│').map(c => c.trim()).filter(Boolean)
        if (cols.length >= 3 && !cols[0].match(/^[-─┌┐└┘├┤┬┴┼]/)) {
          // Skip header row
          if (cols[0] === 'Name' || cols[0] === 'ID' || cols[0] === 'Label') continue
          
          const job = {
            name: cols[0],
            schedule: cols[1] || '',
            status: 'unknown',
            lastRun: null,
            agent: null
          }
          
          // Try to find status/enabled fields
          for (const col of cols) {
            if (/enabled|active|running/i.test(col)) job.status = 'active'
            if (/disabled|paused|stopped/i.test(col)) job.status = 'disabled'
            if (/error|fail/i.test(col)) job.status = 'error'
            if (/ago|AM|PM|\d{4}-\d{2}/i.test(col) && !job.lastRun) job.lastRun = col
            // Agent name detection
            const agentMatch = col.match(/agent[:\s]+(\S+)/i)
            if (agentMatch) job.agent = agentMatch[1]
          }
          
          cronData.jobs.push(job)
        }
      }
    } catch {
      // If cron list command fails, try getting cron info from status
      try {
        const statusOut = execSync('openclaw status 2>&1', { timeout: 10000, encoding: 'utf8' })
        const cronMatch = statusOut.match(/(\d+)\s*cron/i)
        if (cronMatch) cronData.total = parseInt(cronMatch[1])
      } catch {}
    }

    cronData.total = cronData.jobs.length || cronData.total
    cronData.active = cronData.jobs.filter(j => j.status === 'active').length
    cronData.errors = cronData.jobs.filter(j => j.status === 'error').length
    cronData.disabled = cronData.jobs.filter(j => j.status === 'disabled').length

    res.json(cronData)
  } catch (e) {
    res.status(500).json({ error: 'Failed to get cron data', detail: e.message })
  }
}
