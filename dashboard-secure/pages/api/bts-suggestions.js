/**
 * /api/bts-suggestions — BTS client suggestions endpoint
 * GET  → reads suggestions from Vercel Blob storage
 * POST → writes suggestion to Vercel Blob storage
 *
 * Auth: requires bts-client-auth cookie (set by /api/bts-auth) or admin auth
 * Storage: Vercel Blob (BLOB_READ_WRITE_TOKEN env var)
 */

import { put, list } from '@vercel/blob'

const BLOB_KEY = 'bts-suggestions.json'
const SESSION_TOKEN = process.env.BTS_SESSION_TOKEN

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/bts-client-auth=([^;]+)/)
  if (match && SESSION_TOKEN && match[1] === SESSION_TOKEN) return true
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  return false
}

async function readSuggestions() {
  try {
    // List blobs to find our file
    const { blobs } = await list({ prefix: BLOB_KEY })
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { signal: AbortSignal.timeout(5000) })
      if (res.ok) return await res.json()
    }
  } catch (e) {
    console.error('Blob read failed:', e.message)
  }
  return { suggestions: [] }
}

async function writeSuggestions(data) {
  await put(BLOB_KEY, JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false
  })
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.method === 'GET') {
    const data = await readSuggestions()
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Suggestion text required' })
    }

    try {
      const data = await readSuggestions()

      const suggestion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        submittedAt: new Date().toISOString(),
        submittedBy: 'Sunny',
        status: 'new'
      }

      data.suggestions.unshift(suggestion)
      await writeSuggestions(data)

      return res.json({ ok: true, suggestion })
    } catch (e) {
      console.error('Suggestion save failed:', e.message)
      return res.status(500).json({ error: 'Failed to save: ' + e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
