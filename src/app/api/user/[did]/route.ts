import { NextRequest, NextResponse } from 'next/server'
import {getFullProfileById} from "../../../../actions/users";

export async function GET(req: NextRequest,
    { params }: { params: { did: string } }
) {

    let {user, atprotoProfile} = await getFullProfileById(params.did)

    return NextResponse.json({user, atprotoProfile});
}
