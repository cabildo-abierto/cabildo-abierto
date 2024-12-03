'use server'

import { isValidHandle } from "@atproto/syntax"
import { redirect } from "next/navigation"
import { createClient } from "../auth/client"
import { Session } from "../app/oauth/callback/route"
import { Agent } from "@atproto/api"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { env } from "process"
//import { AppViewHandleResolver } from '@atproto-labs/handle-resolver'


export async function login(handle: string){
    const oauthClient = await createClient()

    if (typeof handle !== 'string' || !isValidHandle(handle)) {
        return {error: "Nombre de usuario inválido. Escribilo sin @."}
    }

    /*const resolver = new AppViewHandleResolver('https://api.bsky.app/')
    const did = await resolver.resolve('cabildoabierto.com.ar')
    console.log("CA did", did)*/

    // Initiate the OAuth flow
    let url
    try {
        url = await oauthClient.authorize(handle, {
            scope: 'atproto transition:generic',
        })
    } catch (err) {
        console.log(err)
        return {error: "Falló la conexión con Bluesky."}
    }
    
    return {url: url.toString()}
}


export async function getSessionAgent(){

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

    if (!session.did) {
        return {agent: new Agent("https://bsky.social/xrpc"), did: undefined}
    }
    const oauthClient = await createClient()

    try {
        const oauthSession = await oauthClient.restore(session.did)
        if(oauthSession){
            return {agent: new Agent(oauthSession), did: session.did}
        } else {
            return {agent: new Agent("https://bsky.social/xrpc"), did: undefined}
        }
    } catch (err) {
        session.destroy()
        return {agent: undefined, did: undefined}
    }
}


export async function logout(){

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

    if(session){
        session.destroy()
    }
}