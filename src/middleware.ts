import { NextRequest, NextResponse } from 'next/server'
import {verifySession} from "@/actions/auth";

const protectedRoutes = ['/feed', '/profile']
const publicRoutes = ['/', '/login']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)

    const session = await verifySession()

    // If protected and not logged in we redirect to home page
    if (isProtectedRoute && !session?.userId) {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    // If public and logged in we redirect to feed
    if (
        isPublicRoute &&
        session?.userId &&
        !req.nextUrl.pathname.startsWith('/feed')
    ) {
      return NextResponse.redirect(new URL('/feed', req.nextUrl))
    }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}