
import { NextRequest, NextResponse } from 'next/server';
import {getThread} from "../../../../../actions/thread/thread";


export async function GET(req: NextRequest, { params }: { params: { did: string, rkey: string } }) {

    let thread = await getThread({did: params.did, rkey: params.rkey})

    return NextResponse.json(thread)
}
