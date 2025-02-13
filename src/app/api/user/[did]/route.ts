import { NextRequest, NextResponse } from 'next/server'
import {getUserById} from "../../../../actions/users";

export async function GET(req: NextRequest,
    { params }: { params: { did: string } }
) {

    let {user, atprotoProfile} = await getUserById(params.did)

    return NextResponse.json({user, atprotoProfile});
}
