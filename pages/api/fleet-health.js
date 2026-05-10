export default function handler(req, res) {
  res.status(410).json({
    error: 'Agent fleet health is parked during dashboard de-agenting.',
    title: 'Agent fleet parked',
    agents: [],
    healthy: 0,
    total: 0,
    pct: null,
    parked: true
  })
}
