
import { NextRequest, NextResponse } from 'next/server';
import {getQuotedContent} from "../../../../../actions/contents";


export async function GET(req: NextRequest, { params }: { params: { did: string, rkey: string } }) {

    let thread = await getQuotedContent({did: params.did, rkey: params.rkey})

    return NextResponse.json(thread)
}
