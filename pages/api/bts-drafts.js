/**
 * /api/bts-drafts — BTS Future Posts draft management
 * GET  → reads drafts from GitHub raw (persistent)
 * POST → creates new draft via GitHub Contents API
 *
 * Auth: requires bts-client-auth, dashboard-auth cookie, or x-api-key
 */

const REPO = 'weetbixsnr-cmyk/cairr-command-centre'
const BRANCH = 'agent/command-centre'
const FILE_PATH = 'data/bts-drafts.json'
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}`
const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/bts-client-auth=([^;]+)/)
  const SESSION_TOKEN = process.env.BTS_SESSION_TOKEN
  if (match && SESSION_TOKEN && match[1] === SESSION_TOKEN) return true
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === process.env.BTS_DRAFT_API_KEY) return true
  return false
}

async function readDrafts() {
  try {
    const headers = { 'Cache-Control': 'no-cache' }
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`
    const res = await fetch(RAW_URL, { headers, signal: AbortSignal.timeout(5000) })
    if (res.ok) return await res.json()
  } catch {}
  return { drafts: [] }
}

async function writeDrafts(data, commitMsg) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured')

  let sha = null
  try {
    const getRes = await fetch(`${API_URL}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      signal: AbortSignal.timeout(5000)
    })
    if (getRes.ok) {
      const existing = await getRes.json()
      sha = existing.sha
    }
  } catch {}

  const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64')
  const body = {
    message: commitMsg || 'draft: update BTS drafts',
    content,
    branch: BRANCH
  }
  if (sha) body.sha = sha

  const putRes = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  })

  if (!putRes.ok) {
    const err = await putRes.text()
    throw new Error(`GitHub API error: ${putRes.status} ${err}`)
  }
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.method === 'GET') {
    const data = await readDrafts()
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { title, type, content, targetDate, author } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' })
    }

    try {
      const data = await readDrafts()
      const draft = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title,
        type: type || 'blog',
        content,
        targetDate: targetDate || null,
        author: author || 'BTS Agent',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedContent: null,
        editedBy: null,
        approvedAt: null,
        publishedAt: null,
        desktopChecked: false,
        mobileChecked: false,
        signedOffAt: null,
        feedback: null
      }

      data.drafts.unshift(draft)
      await writeDrafts(data, `draft: new BTS draft — ${title}`)

      return res.json({ ok: true, draft })
    } catch (e) {
      console.error('Draft create failed:', e.message)
      return res.status(500).json({ error: 'Failed to create draft' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
