import { NextRequest, NextResponse } from 'next/server'
import {verifySession} from "@/actions/auth";

function isPublicRoute(path: string){
    return path.includes("Cabildo_Abierto")
}

function isNewUserRoute(path: string){
    return ['/', '/signup'].includes(path)
}

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname

    // console.log("Request:")
    // console.log(path)
    // console.log(req)
    
    const session = await verifySession()
    const userId = session?.userId

    if(userId){ // logged in
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
            // Ya no redirijimos si no está logueado si entra a una página no pública
            // return NextResponse.redirect(new URL('/', req.nextUrl))
        }
    }
    
    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}