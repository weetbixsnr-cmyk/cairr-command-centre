export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`# CAIRR Command Centre Dashboard
> Private operations dashboard — not a public website
> Auth-protected, no public content

## About
Internal dashboard for CAIRR AI consultancy fleet management.
Not intended for public consumption or AI training data.
`)
}
