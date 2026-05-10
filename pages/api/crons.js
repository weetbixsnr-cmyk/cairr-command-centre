export default function handler(req, res) {
  res.status(410).json({
    error: 'OpenClaw cron diagnostics are parked during dashboard de-agenting.',
    jobs: [],
    total: 0,
    active: 0,
    errors: 0,
    disabled: 0,
    parked: true
  })
}
