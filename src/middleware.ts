import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { Session } from './app/oauth/callback/route'
import { cookies } from 'next/headers'
import { env } from 'process'

function isNewUserRoute(request: NextRequest){
  return ['/', '/signup', '/login', '/auth'].includes(request.nextUrl.pathname)
}

export async function middleware(request: NextRequest) {
    const session = await getIronSession<Session>(await cookies(), {
        cookieName: 'sid',
        password: env.COOKIE_SECRET || "",
        cookieOptions: {
            sameSite: "lax",
            httpOnly: true,
            secure: false,
            path: "/"
        }
    })

    const loggedIn = session.did != undefined

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

    if (
      !loggedIn && !isNewUserRoute(request)
    ) {
      // no user, potentially respond by redirecting the user to the login page
      // const url = request.nextUrl.clone()
      // url.pathname = '/'
      // return NextResponse.redirect(url)
    } else if(loggedIn && isNewUserRoute(request)){
      const url = request.nextUrl.clone()
      url.pathname = '/inicio'
      return NextResponse.redirect(url)
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