import {NextRequest, NextResponse} from 'next/server';
import {getEnDiscusion, getFollowingFeed} from "../../../../actions/feed/inicio";
import { FeedContentProps } from '../../../lib/definitions';


export async function GET(req: NextRequest, {params}: {params: Promise<{kind: string}>}) {
    const {kind} = await params

    let feed: { feed?: FeedContentProps[]; error?: string }
    if(kind == "InDiscussion"){
        feed = await getEnDiscusion()
    } else if(kind == "Following"){
        feed = await getFollowingFeed()
    }

    return NextResponse.json(feed)
}
