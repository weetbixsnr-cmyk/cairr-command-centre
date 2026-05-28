/**
 * /api/bts-drafts - BTS draft snapshot.
 *
 * Reads the same split BTS snapshot path as /bts-seo. Content lifecycle writes
 * happen in the BTS source repo and arrive here through exported JSON copies.
 */

import { isBtsAuthed } from '../../lib/auth'
import { buildDashboardSnapshot } from '../../lib/dashboard-data'

export default async function handler(req, res) {
  if (!isBtsAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') {
    return res.json(buildDashboardSnapshot().btsDrafts || { drafts: [] })
  }

  if (req.method === 'POST') {
    return res.status(409).json({
      error: 'BTS content lifecycle writes are disabled in Command Centre. Update BTS content.json and copy the approved snapshot into public/data/bts/content.json.'
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
