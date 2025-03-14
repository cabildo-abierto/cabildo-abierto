
import { NextRequest, NextResponse } from 'next/server';
import {getBskyFastPost} from "../../../../../actions/feed/quoted-content";
import {getUri} from "../../../../../components/utils/utils";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let thread = await getBskyFastPost(getUri(did, "app.bksy.feed.post", rkey))
    return NextResponse.json(thread)
}
