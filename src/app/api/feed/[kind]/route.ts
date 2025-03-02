
import { NextRequest, NextResponse } from 'next/server';
import {getEnDiscusion, getFollowingFeed} from "../../../../actions/feed/inicio";


export async function GET(req: NextRequest,
    { params }: { params: { kind: string } }
) {
    const kind = params.kind

    let feed
    if(kind == "InDiscussion"){
        feed = await getEnDiscusion()
    } else if(kind == "Following"){
        feed = await getFollowingFeed()
    }

    return NextResponse.json(feed)
}
