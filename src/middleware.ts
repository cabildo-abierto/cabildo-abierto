import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'

import { Session } from './app/oauth/callback/route'
import { cookies } from 'next/headers'
import {myCookieOptions} from "./components/utils/utils";


function isNewUserRoute(request: NextRequest){
  return ['/signup', '/login'].includes(request.nextUrl.pathname)
}

function isPublicRoute(request: NextRequest){
    return ["/v1", "/.well-known/atproto-did", "/client-metadata.json", "/presentacion", "/oauth/callback"].includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/api/")
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()

    if(url.pathname.startsWith("/wiki/")){
        const id = url.searchParams.get("i")

        const articleUrl = new URL('/tema', request.url)

        articleUrl.searchParams.set('i', id)
        return NextResponse.redirect(articleUrl)
    }

    if(url.pathname.startsWith("/articulo")){
        const id = url.searchParams.get("i")
        const articleUrl = new URL('/tema', request.url)
        articleUrl.searchParams.set('i', decodeURIComponent(id))
        return NextResponse.redirect(articleUrl)
    }

    if(url.pathname.startsWith("/articulo/")){
        const id = url.searchParams.get("i")
        const articleUrl = new URL('/tema', request.url)
        articleUrl.searchParams.set('i', decodeURIComponent(id))
        return NextResponse.redirect(articleUrl)
    }

    if(url.pathname.startsWith("/contenido/")){
        const id = url.searchParams.get("i")
        const articleUrl = new URL('/tema', request.url)

        articleUrl.searchParams.set('i', id)
        return NextResponse.redirect(articleUrl)
    }

    const session = await getIronSession<Session>(await cookies(), myCookieOptions)

    const loggedIn = session.did != undefined

    if(!isPublicRoute(request)){
        if(request.nextUrl.pathname == "/") {
            if(loggedIn){
                url.pathname = '/inicio'
            } else {
                url.pathname = "/presentacion"
            }
        } else if (!loggedIn && !isNewUserRoute(request)) {
            url.pathname = '/'
        } else if(loggedIn && isNewUserRoute(request)){
            url.pathname = '/inicio'
        } else {
            return
        }
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}