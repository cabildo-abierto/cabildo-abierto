
import { NextRequest, NextResponse } from 'next/server';
import {getEnDiscusion, getFollowingFeed} from '../../../../actions/feed';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const kind = params.route[params.route.length-1]

    let feed
    if(kind == "InDiscussion"){
        feed = (await getEnDiscusion()).feed
    } else if(kind == "Following"){
        feed = (await getFollowingFeed()).feed
    }


    return NextResponse.json(feed == undefined ? null : feed)
}
