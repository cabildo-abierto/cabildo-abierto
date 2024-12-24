'use server'

import { isValidHandle } from "@atproto/syntax"
import { createClient } from "../auth/client"
import { Session } from "../app/oauth/callback/route"
import { Agent } from "@atproto/api"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import {AppViewHandleResolver} from "@atproto/oauth-client-node";
import {myCookieOptions} from "../components/utils";


export async function login(handle: string){

    const oauthClient = await createClient()

    if (typeof handle !== 'string' || !isValidHandle(handle)) {
        return {error: "Nombre de usuario inválido." + (handle.includes("@") ? " Escribilo sin @." : "")}
    }

    // Initiate the OAuth flow
    let url
    try {
        url = await oauthClient.authorize(handle, {
            scope: 'atproto transition:generic'
        })
    } catch (err) {
        // TO DO: Esto no debería hacer falta...
        console.log("error", err)

        const resolver = new AppViewHandleResolver('https://api.bsky.app/')
        const did = await resolver.resolve(handle)

        if(did){
            try {
                url = await oauthClient.authorize(did, {
                    scope: 'atproto transition:generic'
                })
            } catch(err) {
                console.log("error on did authorize", err)
                return {error: "Falló la conexión con Bluesky."}
            }
        } else {
            return {error: "Falló la conexión con Bluesky."}
        }
    }
    
    return {url: url.toString()}
}


export async function getSessionAgent(){

    const session = await getIronSession<Session>(cookies(), myCookieOptions)

    if (!session.did) {
        return {agent: new Agent("https://bsky.social/xrpc"), did: undefined}
    }

    const oauthClient = await createClient()

    try {
        const oauthSession = await oauthClient.restore(session.did)
        const token = await oauthSession.getTokenInfo()
        if(oauthSession){
            return {agent: new Agent(oauthSession), did: session.did}
        } else {
            return {agent: new Agent("https://bsky.social/xrpc"), did: undefined}
        }
    } catch (err) {
        console.log("error", err)
        session.destroy()
        return {agent: undefined, did: undefined}
    }
}


export async function logout(){
    const client = await createClient()

    const session = await getIronSession<Session>(cookies(), myCookieOptions)

    await client.revoke(session.did)
    session.destroy()
}