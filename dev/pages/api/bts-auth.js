/**
 * /api/bts-auth — BTS client login
 * POST { user, pass } → sets bts-client-auth cookie
 * 
 * Env vars required:
 *   BTS_CLIENT_USER — Sunny's username
 *   BTS_CLIENT_PASS — Sunny's password
 *   BTS_SESSION_TOKEN — session token for cookie validation
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, pass } = req.body
  if (!user || !pass) {
    return res.status(400).json({ ok: false, error: 'Username and password required' })
  }

  const validUser = process.env.BTS_CLIENT_USER
  const validPass = process.env.BTS_CLIENT_PASS
  const sessionToken = process.env.BTS_SESSION_TOKEN

  if (!validUser || !validPass || !sessionToken) {
    console.error('BTS auth env vars not configured')
    return res.status(500).json({ ok: false, error: 'Auth not configured' })
  }

  if (user === validUser && pass === validPass) {
    // Set session cookie
    res.setHeader('Set-Cookie', [
      `bts-client-auth=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}` // 30 days
    ])
    return res.json({ ok: true })
  }

  return res.status(401).json({ ok: false, error: 'Invalid credentials' })
}
