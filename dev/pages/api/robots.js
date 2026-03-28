export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`User-agent: *
Disallow: /

# Dashboard is auth-protected, not for public indexing
# Sitemap: none (private app)
`)
}
