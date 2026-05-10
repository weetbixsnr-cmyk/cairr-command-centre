export default function handler(req, res) {
  res.status(410).json({
    error: 'Agent governance diagnostics are parked during dashboard de-agenting.',
    title: 'Agent governance parked',
    agents: [],
    ok: 0,
    total: 0,
    parked: true
  })
}
