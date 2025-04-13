import { NextRequest, NextResponse } from 'next/server';
import {getThread} from "@/server-actions/thread/thread";
import {getUri} from "@/utils/uri";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, c: string, rkey: string }> }) {
    const {did, c, rkey} = await params

    let thread = await getThread(getUri(did, c, rkey))
    return NextResponse.json(thread)
}
