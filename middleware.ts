import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle common redirects
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // Handle old route patterns
  if (pathname.startsWith('/admin/users')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Handle invalid artist routes (basic validation)
  if (pathname.match(/^\/[^\/]+\/listening-room$/) && pathname.includes('..')) {
    return NextResponse.redirect(new URL('/not-found', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
