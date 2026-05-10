/**
 * /api/data - dashboard-owned status data.
 *
 * This endpoint intentionally does not read the Command Centre agent branch,
 * public/snapshot.json, OpenClaw CLI output, or .openclaw agent workspaces.
 */

import { buildDashboardSnapshot } from '../../lib/dashboard-data'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

  const snapshot = buildDashboardSnapshot()
  const { section, agent } = req.query

  if (agent) {
    return res.status(410).json({
      error: 'Agent detail pages are parked during dashboard de-agenting.',
      dataSource: snapshot.dataSource,
      timestamp: snapshot.timestamp
    })
  }

  if (section && snapshot[section] !== undefined) {
    return res.json({ [section]: snapshot[section], timestamp: snapshot.timestamp })
  }

  return res.json(snapshot)
}
