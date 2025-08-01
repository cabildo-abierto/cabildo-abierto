import { NextResponse, type NextRequest } from 'next/server'


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