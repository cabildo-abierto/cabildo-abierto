import { NextRequest, NextResponse } from 'next/server'
import {getThread} from "../../../../../actions/contents"

export async function GET(req: NextRequest,
    { params }: { params: { did: string, rkey: string } }
) {

    let {thread} = await getThread({collection: "ar.com.cabildoabierto.article", did: params.did, rkey: params.rkey})

    return NextResponse.json(thread ? thread.post : null);
}
