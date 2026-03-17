import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // ── Always allow without auth ──
  if (pathname === '/bts-login' || pathname === '/api/bts-auth') {
    return NextResponse.next()
  }
  
  // ── Check main dashboard auth (Adam/Brain) — grants everything ──
  const dashSession = request.cookies.get('dashboard-auth')
  const mainAuthed = dashSession?.value === process.env.DASHBOARD_SESSION_TOKEN
  
  if (!mainAuthed) {
    // Check Basic Auth header
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const auth = authHeader.split(' ')[1]
      const [user, pass] = Buffer.from(auth, 'base64').toString().split(':')
      
      if (user === process.env.DASHBOARD_USER && pass === process.env.DASHBOARD_PASS) {
        const response = NextResponse.next()
        response.cookies.set('dashboard-auth', process.env.DASHBOARD_SESSION_TOKEN, {
          httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7
        })
        return response
      }
    }
  }
  
  if (mainAuthed) {
    return NextResponse.next()
  }
  
  // ── BTS client auth — only grants BTS routes + API ──
  const btsSession = request.cookies.get('bts-client-auth')
  const btsAuthed = btsSession?.value === process.env.BTS_SESSION_TOKEN
  
  if (btsAuthed) {
    // BTS clients can access: /bts-seo*, /api/data (read-only snapshot)
    if (pathname.startsWith('/bts-seo') || pathname === '/api/data') {
      return NextResponse.next()
    }
    // Block everything else — redirect to BTS SEO
    const url = request.nextUrl.clone()
    url.pathname = '/bts-seo'
    return NextResponse.redirect(url)
  }
  
  // ── Not authenticated at all ──
  
  // BTS routes → redirect to BTS login
  if (pathname.startsWith('/bts-seo')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/bts-login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Everything else → Basic Auth prompt
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Command Centre"' },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
