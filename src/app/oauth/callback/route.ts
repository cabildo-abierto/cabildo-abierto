import { createClient } from "../../../auth/client";
import assert from "assert";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from 'iron-session'
import { cookies } from "next/headers";
import { createNewCAUserForBskyAccount } from "../../../actions/users";
import {env} from "process";

export type Session = {did: string}

export async function GET(req: NextRequest){
    const params = new URLSearchParams(req.url.split('?')[1])
    const oauthClient = await createClient()

    const baseUrl = env.PUBLIC_URL ? env.PUBLIC_URL : "http://localhost:3000"

    try {
        assert(process.env.COOKIE_SECRET)
        const { session } = await oauthClient.callback(params)

        const clientSession = await getIronSession<Session>(await cookies(), {
            cookieName: 'sid',
            password: process.env.COOKIE_SECRET || "",
            cookieOptions: {
                sameSite: "lax",
                httpOnly: true,
                secure: false,
                path: "/"
            }
        })

        assert(!clientSession.did, 'session already exists')
        clientSession.did = session.did

        await clientSession.save()

        const res = await createNewCAUserForBskyAccount(session.did)

        if(res.error){
            return NextResponse.redirect(baseUrl + '/login')
        }
    } catch (err) {
        return NextResponse.redirect(baseUrl + '/login')
    }
    return NextResponse.redirect(baseUrl + '/inicio')
}