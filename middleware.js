import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  const sessionCookie = request.cookies.get('dashboard-auth')
  const btsSessionCookie = request.cookies.get('bts-client-auth')
  const dashboardToken = process.env.DASHBOARD_SESSION_TOKEN

  if (dashboardToken && sessionCookie?.value === dashboardToken) {
    return NextResponse.next()
  }

  if (pathname === '/bts-login') {
    return NextResponse.next()
  }

  const btsToken = process.env.BTS_SESSION_TOKEN
  if (pathname === '/bts-seo' && btsToken && btsSessionCookie?.value === btsToken) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  const dashUser = process.env.DASHBOARD_USER
  const dashPass = process.env.DASHBOARD_PASS
  if (authHeader && dashUser && dashPass && dashboardToken) {
    const auth = authHeader.split(' ')[1]
    const [user, pass] = Buffer.from(auth, 'base64').toString().split(':')
    if (user === dashUser && pass === dashPass) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.set('dashboard-auth', dashboardToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7
      })
      return response
    }
  }

  if (pathname === '/bts-seo') {
    const loginUrl = new URL('/bts-login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

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
