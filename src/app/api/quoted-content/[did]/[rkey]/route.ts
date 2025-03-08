
import { NextRequest, NextResponse } from 'next/server';
import {getQuotedContent} from "../../../../../actions/contents";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let thread = await getQuotedContent({did: did, rkey: rkey})

    return NextResponse.json(thread)
}
