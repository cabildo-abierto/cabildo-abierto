import { NextRequest, NextResponse } from 'next/server'
import {getThread} from "../../../../actions/contents"

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    let {thread} = await getThread({collection: "ar.com.cabildoabierto.article", cid: params.id})

    return NextResponse.json(thread ? thread.post : null);
}
