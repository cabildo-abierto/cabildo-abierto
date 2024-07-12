import { NextRequest, NextResponse } from 'next/server'
import {verifySession} from "@/actions/auth";

const newUserRoutes = ['/', '/signup']
const publicRoutes = ['/wiki/Cabildo_Abierto']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isPublicRoute = publicRoutes.includes(path)
    const isNewUserRoute = newUserRoutes.includes(path)

    const session = await verifySession()
    const loggedIn = session?.userId

    if(loggedIn){
        if(isNewUserRoute){
            return NextResponse.redirect(new URL('/inicio', req.nextUrl))
        } else {
            // todo ok
        }
    } else {
        if(isNewUserRoute){
            // todo ok
        } else if(isPublicRoute){
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