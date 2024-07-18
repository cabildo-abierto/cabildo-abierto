import { NextRequest, NextResponse } from 'next/server'
import {verifySession} from "@/actions/auth";

function isPublicRoute(path){
    return path.includes("Cabildo_Abierto")
}

function isNewUserRoute(path){
    return ['/', '/signup'].includes(path)
}

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname

    const session = await verifySession()
    const loggedIn = session?.userId

    if(loggedIn){
        if(isNewUserRoute(path)){
            return NextResponse.redirect(new URL('/inicio', req.nextUrl))
        } else {
            // todo ok
        }
    } else {
        if(isNewUserRoute(path)){
            // todo ok
        } else if(isPublicRoute(path)){
            // todo ok
        } else {
            return NextResponse.redirect(new URL('/', req.nextUrl))
        }
    }
    
    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}