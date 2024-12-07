import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'

import { Session } from './app/oauth/callback/route'
import { cookies } from 'next/headers'


function isNewUserRoute(request: NextRequest){
  return ['/', '/signup', '/login', "/oauth/callback"].includes(request.nextUrl.pathname)
}

function isPublicRoute(request: NextRequest){
    return ["/v1", "/.well-known/atproto-did", "/client-metadata.json"].includes(request.nextUrl.pathname)
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()

    if(url.pathname.startsWith("/wiki/")){
      const id = url.pathname.split("/wiki/")[1]
      
      const articleUrl = new URL('/articulo', request.url)

      articleUrl.searchParams.set('i', id)
      return NextResponse.redirect(articleUrl)
    }

    if(url.pathname.startsWith("/articulo/")){
      const id = url.pathname.split("/articulo/")[1]
      const articleUrl = new URL('/articulo', request.url)
      articleUrl.searchParams.set('i', decodeURIComponent(id))
      return NextResponse.redirect(articleUrl)
    }

    if(url.pathname.startsWith("/contenido/")){
      const id = url.pathname.split("/contenido/")[1]
      const articleUrl = new URL('/contenido', request.url)

      articleUrl.searchParams.set('i', id)
      return NextResponse.redirect(articleUrl)
    }

    const session = await getIronSession<Session>(await cookies(), {
        cookieName: 'sid',
        password: process.env.COOKIE_SECRET || "",
        cookieOptions: {
            sameSite: "lax",
            httpOnly: true,
            secure: false,
            path: "/"
        }
    })

    const loggedIn = session.did != undefined

    console.log(request.nextUrl.pathname)
    if(!isPublicRoute(request)){
        if (
            !loggedIn && !isNewUserRoute(request)
        ) {
            // no user, potentially respond by redirecting the user to the login page
            console.log("Redirecting to /")
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        } else if(loggedIn && isNewUserRoute(request)){
            console.log("Redirecting to /inicio")
            const url = request.nextUrl.clone()
            url.pathname = '/inicio'
            return NextResponse.redirect(url)
        }
    } else {
        console.log("Public route")
    }

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