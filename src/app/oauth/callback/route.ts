import { createClient } from "../../../auth/client";
import assert from "assert";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from 'iron-session'
import { cookies } from "next/headers";
import {setATProtoProfile} from "../../../actions/user/users";
import {Agent} from "@atproto/api";
import {myCookieOptions} from "../../../components/utils/auth";


export type Session = {did: string, agent: Agent}

export async function GET(req: NextRequest){
    const params = new URLSearchParams(req.url.split('?')[1])
    const oauthClient = await createClient()

    const baseUrl = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "http://127.0.0.1:3000"

    try {
        assert(process.env.COOKIE_SECRET)
        const { session } = await oauthClient.callback(params)

        const clientSession = await getIronSession<Session>(await cookies(), myCookieOptions)

        clientSession.did = session.did

        await clientSession.save()

        const {error: setATProtoError} = await setATProtoProfile(session.did)

        if(setATProtoError){
            return NextResponse.redirect(baseUrl + '/login')
        }
        return NextResponse.redirect(baseUrl + '/login/ok')
    } catch (err) {
        console.error("error", err)
        return NextResponse.redirect(baseUrl + '/login')
    }
}