import {NextRequest, NextResponse} from 'next/server';
import {getDiscoverFeed, getEnDiscusion, getFollowingFeed} from "@/server-actions/feed/inicio";
import { FeedContentProps } from '@/lib/definitions';


export async function GET(req: NextRequest, {params}: {params: Promise<{kind: string}>}) {
    const {kind} = await params

    let feed: { feed?: FeedContentProps[]; error?: string }
    if(kind == "EnDiscusion"){
        feed = await getEnDiscusion()
    } else if(kind == "Siguiendo"){
        feed = await getFollowingFeed()
    } else if(kind == "Descubrir"){
        feed = await getDiscoverFeed()
    }

    return NextResponse.json(feed)
}
