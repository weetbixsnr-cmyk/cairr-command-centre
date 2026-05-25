export function isDashboardAuthed(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/dashboard-auth=([^;]+)/)
  const token = process.env.DASHBOARD_SESSION_TOKEN
  if (!token) return false
  return match?.[1] === token
}

export function isBtsAuthed(req) {
  const cookie = req.headers.cookie || ''

  const btsMatch = cookie.match(/bts-client-auth=([^;]+)/)
  const btsToken = process.env.BTS_SESSION_TOKEN
  if (btsMatch && btsToken && btsMatch[1] === btsToken) return true

  if (isDashboardAuthed(req)) return true

  const apiKey = req.headers['x-api-key']
  const draftKey = process.env.BTS_DRAFT_API_KEY
  if (apiKey && draftKey && apiKey === draftKey) return true

  return false
}

export function isNbhwAuthed(req) {
  if (isDashboardAuthed(req)) return true

  const apiKey = req.headers['x-api-key']
  const draftKey = process.env.NBHW_DRAFT_API_KEY
  if (apiKey && draftKey && apiKey === draftKey) return true

  return false
}

export function canWriteJson() {
  if (process.env.VERCEL) return !!process.env.ENABLE_JSON_WRITES
  return true
}
