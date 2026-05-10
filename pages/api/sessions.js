export default function handler(req, res) {
  res.status(410).json({
    error: 'OpenClaw session diagnostics are parked during dashboard de-agenting.',
    sessions: [],
    byAgent: {},
    heartbeats: {},
    totalAgents: 0,
    totalSessions: 0,
    parked: true
  })
}
