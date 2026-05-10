export default function handler(req, res) {
  res.status(410).json({
    error: 'Agent report APIs are parked during dashboard de-agenting.',
    reports: {},
    count: 0,
    parked: true
  })
}
