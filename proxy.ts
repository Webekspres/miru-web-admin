import { NextResponse, type NextRequest } from 'next/server'
import {
  AUTH_ROUTES,
  PUBLIC_ASSET_PREFIXES,
  PUBLIC_FILE,
  PUBLIC_ROUTES,
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

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function isPublicAsset(pathname: string): boolean {
  if (PUBLIC_FILE.test(pathname)) return true
  return PUBLIC_ASSET_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Manifest/favicon/logo: jangan auth-gate — request ini sering tanpa cookie
  // dan dulu me-redirect petugas ke /transactions/add (loop).
  if (isPublicAsset(pathname)) {
    return NextResponse.next()
  }

  const hasToken = Boolean(request.cookies.get(TOKEN_KEYS.access)?.value)
  const onAuthRoute = isAuthRoute(pathname)
  const onPublicRoute = isPublicRoute(pathname)
  const roleCookie = request.cookies.get(ROLE_COOKIE_KEY)?.value
  const role = roleCookie && isWebAdminRoleValue(roleCookie) ? roleCookie : null

  if (hasToken && onAuthRoute) {
    const landing = role ? getLandingPathForRole(role) : '/dashboard'
    return NextResponse.redirect(new URL(landing, request.url))
  }

  if (hasToken && pathname === '/') {
    const landing = role ? getLandingPathForRole(role) : '/dashboard'
    return NextResponse.redirect(new URL(landing, request.url))
  }

  if (!hasToken && !onAuthRoute && !onPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasToken && role && !onPublicRoute && !onAuthRoute && !canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL(getLandingPathForRole(role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json)$).*)',
  ],
}
