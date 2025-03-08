import { NextRequest, NextResponse } from 'next/server';
import {getTopicFeed} from "../../../../actions/feed/topic";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    let feed = await getTopicFeed(id)

    return NextResponse.json(feed);
}
