
import { NextRequest, NextResponse } from 'next/server';
import {getBskyFastPost} from "@/server-actions/feed/quoted-content";

import {getUri} from "../../../../../utils/uri";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let post = await getBskyFastPost(getUri(did, "app.bksy.feed.post", rkey))
    return NextResponse.json(post)
}
