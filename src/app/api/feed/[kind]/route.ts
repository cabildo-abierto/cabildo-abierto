import {NextRequest, NextResponse} from 'next/server';
import { FeedContentProps } from '@/lib/definitions';
import {getFollowingFeed} from "@/server-actions/feed/inicio/following";
import {getEnDiscusion} from "@/server-actions/feed/inicio/en-discusion";
import {getDiscoverFeed} from "@/server-actions/feed/inicio/discover";


export async function GET(req: NextRequest, {params}: {params: Promise<{kind: string}>}) {
    const {kind} = await params

    let feed: { feed?: FeedContentProps[]; error?: string }
    if(kind == "discusion"){
        feed = await getEnDiscusion()
    } else if(kind == "siguiendo"){
        feed = await getFollowingFeed()
    } else if(kind == "descubrir"){
        feed = await getDiscoverFeed()
    }

    return NextResponse.json(feed)
}
