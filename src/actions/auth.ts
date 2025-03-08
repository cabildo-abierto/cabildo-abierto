'use server'

import { isValidHandle } from "@atproto/syntax"
import { createClient } from "../auth/client"
import { Session } from "../app/oauth/callback/route"
import { Agent } from "@atproto/api"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import {AppViewHandleResolver} from "@atproto/oauth-client-node";
import {myCookieOptions} from "../components/utils/utils";


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

        const resolver = new AppViewHandleResolver('https://api.bsky.app/')
        const did = await resolver.resolve(handle)

        if(did){
            try {
                url = await oauthClient.authorize(did, {
                    scope: 'atproto transition:generic'
                })
            } catch(err) {
                console.error("error on did authorize", err)
                return {error: "Falló la conexión."}
            }
        } else {
            return {error: "Falló la conexión."}
        }
    }
    
    return {url: url.toString()}
}


export async function getSessionDid() {
    const session = await getIronSession<Session>(await cookies(), myCookieOptions);
    return session.did
}


export async function getSessionAgent(){
    const session = await getIronSession<Session>(await cookies(), myCookieOptions)

    if (!session.did) {
        return {agent: new Agent("https://bsky.social/xrpc"), did: undefined}
    }

    const t1 = Date.now()
    const oauthClient = await createClient()
    const t2 = Date.now()

    try {
        const oauthSession = await oauthClient.restore(session.did)
        const t3 = Date.now()
        if(oauthSession){
            const res = {
                agent: new Agent(oauthSession),
                did: session.did
            }
            const t4 = Date.now()
            // console.log("create client time", t2-t1)
            // console.log("session restore time", t3-t2)
            // console.log("agent form oauth session time", t4-t3)
            // console.log("get session agent time", t4-t1)
            return res
        } else {
            return {agent: new Agent("https://bsky.social/xrpc"), did: undefined}
        }
    } catch (err) {
        console.error("error", err)
        session.destroy()
        return {agent: undefined, did: undefined}
    }
}


export async function logout(){
    const client = await createClient()

    const session = await getIronSession<Session>(await cookies(), myCookieOptions)

    await client.revoke(session.did)
    session.destroy()
}