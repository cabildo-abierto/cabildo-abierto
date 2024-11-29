import { createClient } from "../../../auth/client";
import assert from "assert";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from 'iron-session'
import { env } from 'process'
import { cookies } from "next/headers";
import { createNewCAUserForBskyAccount } from "../../../actions/users";

export type Session = {did: string}

export async function GET(req: NextRequest){
    const params = new URLSearchParams(req.url.split('?')[1])
    const oauthClient = await createClient()

    try {
        assert(env.COOKIE_SECRET)
        const { session } = await oauthClient.callback(params)

        const clientSession = await getIronSession<Session>(await cookies(), {
            cookieName: 'sid',
            password: env.COOKIE_SECRET || "",
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

        await createNewCAUserForBskyAccount(session.did)
    } catch (err) {
        return NextResponse.redirect('http://127.0.0.1:3000/inicio')
    }
    return NextResponse.redirect('http://127.0.0.1:3000/inicio')
}