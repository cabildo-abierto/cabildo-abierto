import { NextRequest, NextResponse } from 'next/server'
import {getFullProfileById} from "../../../../actions/users";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ did: string }> }
) {
    const {did} = await params

    let {user, atprotoProfile} = await getFullProfileById(did)

    return NextResponse.json({user, atprotoProfile});
}
