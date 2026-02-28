import { NextResponse } from 'next/server'

export function middleware(request) {
  // Check for authorization header
  const authHeader = request.headers.get('authorization')
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('dashboard-auth')
  
  // If has valid session, allow access
  if (sessionCookie?.value === process.env.DASHBOARD_SESSION_TOKEN) {
    return NextResponse.next()
  }
  
  // Check basic auth
  if (authHeader) {
    const auth = authHeader.split(' ')[1]
    const [user, pass] = Buffer.from(auth, 'base64').toString().split(':')
    
    if (user === process.env.DASHBOARD_USER && pass === process.env.DASHBOARD_PASS) {
      // Set session cookie and redirect to remove auth header from URL
      const response = NextResponse.redirect(new URL('/complete', request.url))
      response.cookies.set('dashboard-auth', process.env.DASHBOARD_SESSION_TOKEN, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      return response
    }
  }
  
  // Require authentication
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Command Centre"',
    },
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}