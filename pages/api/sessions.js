import { execSync } from 'child_process'

export default function handler(req, res) {
  try {
    const out = execSync('openclaw status 2>&1', { timeout: 15000, encoding: 'utf8' })

    // Parse session rows from the table
    // Format: │ key │ kind │ age │ model │ tokens │
    const sessions = []
    const sessionLines = out.split('\n').filter(l => /agent:/.test(l))
    
    for (const line of sessionLines) {
      const cols = line.split('│').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 5) {
        const key = cols[0]
        const kind = cols[1]
        const age = cols[2]
        const model = cols[3]
        const tokenStr = cols[4]
        
        // Parse tokens: "17k/200k (9%) · 🗄️ 94% cached"
        const tokenMatch = tokenStr.match(/(\d+k?)\/(\d+k?)\s*\((\d+)%\)/)
        const cacheMatch = tokenStr.match(/(\d+)%\s*cached/)
        
        // Extract agent name from key like "agent:command-centre:discord:ch..."
        const agentMatch = key.match(/^agent:([^:]+):/)
        
        sessions.push({
          key,
          agent: agentMatch ? agentMatch[1] : key,
          kind,
          age,
          model,
          tokensUsed: tokenMatch ? tokenMatch[1] : '?',
          tokensMax: tokenMatch ? tokenMatch[2] : '?',
          contextPct: tokenMatch ? parseInt(tokenMatch[3]) : null,
          cachePct: cacheMatch ? parseInt(cacheMatch[1]) : null
        })
      }
    }

    // Aggregate by agent
    const byAgent = {}
    for (const s of sessions) {
      if (!byAgent[s.agent]) {
        byAgent[s.agent] = { sessions: [], totalContextPct: 0, count: 0, model: s.model }
      }
      byAgent[s.agent].sessions.push(s)
      if (s.contextPct !== null) {
        byAgent[s.agent].totalContextPct += s.contextPct
        byAgent[s.agent].count++
      }
    }

    // Calculate averages
    for (const agent of Object.values(byAgent)) {
      agent.avgContextPct = agent.count > 0 ? Math.round(agent.totalContextPct / agent.count) : null
    }

    // Parse heartbeat line
    const heartbeatLine = out.match(/Heartbeat\s*│\s*(.+?)│/s)
    const heartbeats = {}
    if (heartbeatLine) {
      const hbText = heartbeatLine[1]
      const hbMatches = hbText.matchAll(/(disabled|enabled|ok|error)\s*\((\w[\w-]*)\)/gi)
      for (const m of hbMatches) {
        heartbeats[m[2]] = m[1].toLowerCase()
      }
    }

    // Parse agents count
    const agentCountMatch = out.match(/Agents\s*│\s*(\d+)/)
    const sessionCountMatch = out.match(/sessions\s+(\d+)/)

    res.json({
      sessions,
      byAgent,
      heartbeats,
      totalAgents: agentCountMatch ? parseInt(agentCountMatch[1]) : null,
      totalSessions: sessionCountMatch ? parseInt(sessionCountMatch[1]) : sessions.length,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to get session data', detail: e.message })
  }
}
