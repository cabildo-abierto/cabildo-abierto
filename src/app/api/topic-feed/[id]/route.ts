import { NextRequest, NextResponse } from 'next/server';
import {getTopicFeed} from "../../../../actions/feed";

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    let feed = await getTopicFeed(params.id)

    return NextResponse.json(feed);
}
