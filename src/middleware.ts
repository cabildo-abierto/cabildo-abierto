import { NextResponse, type NextRequest } from 'next/server'
import {backendUrl} from "@/utils/uri";


function isNewUserRoute(request: NextRequest){
  return ['/login'].includes(request.nextUrl.pathname)
}

function isPublicRoute(request: NextRequest){
    return ["/bingo", "/v1", "/.well-known/atproto-did", "/client-metadata.json", "/presentacion", "/api/oauth/callback", "/login/ok"].includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/api/")
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

    const cookieHeader = request.headers.get('cookie');

    let status = "server down"
    try {
        // esto no termina de funcionar
        const res = await fetch(backendUrl + "/session", {
            headers: {
                cookie: cookieHeader || ''
            },
            next: { revalidate: 0 }
        })
        const session = await res.json()
        if(session && session.data){
            status = "authenticated"
        } else {
            status = "not authenticated"
        }
    } catch (e) {

    }

    if(status == "server down"){
        if(!request.nextUrl.pathname.includes("/mantenimiento")){
            url.pathname = "/mantenimiento"
            return NextResponse.redirect(url)
        }
    } else if(url.pathname == "/"){
        url.pathname = "/inicio"
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