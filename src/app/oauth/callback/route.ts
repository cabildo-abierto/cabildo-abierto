import { createClient } from "../../../auth/client";
import assert from "assert";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from 'iron-session'
import { cookies } from "next/headers";
import { createNewCAUserForBskyAccount } from "../../../actions/users";
import {myCookieOptions} from "../../../components/utils";

export type Session = {did: string}

export async function GET(req: NextRequest){
    const params = new URLSearchParams(req.url.split('?')[1])
    const oauthClient = await createClient()

    const baseUrl = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "http://127.0.0.1:3000"

    try {
        assert(process.env.COOKIE_SECRET)
        const { session } = await oauthClient.callback(params)

        const clientSession = await getIronSession<Session>(cookies(), myCookieOptions)

        clientSession.did = session.did

        await clientSession.save()

        const {error: createError} = await createNewCAUserForBskyAccount(session.did)

        if(createError){
            return NextResponse.redirect(baseUrl + '/login')
        }
        return NextResponse.redirect(baseUrl + '/')
    } catch (err) {
        console.log("error", err)
        console.log("redirecting to /login")
        return NextResponse.redirect(baseUrl + '/login')
    }
}