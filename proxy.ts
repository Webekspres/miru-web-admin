import { NextResponse, type NextRequest } from 'next/server'
import {
  AUTH_ROUTES,
  PUBLIC_FILE,
  ROLE_COOKIE_KEY,
  TOKEN_KEYS,
} from '@/lib/auth-constants'
import {
  canAccessRoute,
  getLandingPathForRole,
  isWebAdminRoleValue,
} from '@/lib/routes'

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  const hasToken = Boolean(request.cookies.get(TOKEN_KEYS.access)?.value)
  const onAuthRoute = isAuthRoute(pathname)
  const roleCookie = request.cookies.get(ROLE_COOKIE_KEY)?.value
  const role = roleCookie && isWebAdminRoleValue(roleCookie) ? roleCookie : null

  if (hasToken && onAuthRoute) {
    const landing = role ? getLandingPathForRole(role) : '/'
    return NextResponse.redirect(new URL(landing, request.url))
  }

  if (!hasToken && !onAuthRoute) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (hasToken && role && !onAuthRoute && !canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL(getLandingPathForRole(role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
