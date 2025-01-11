import { NextRequest, NextResponse } from 'next/server';
import {getProfileFeed} from "../../../../../actions/feed";


export async function GET(req: NextRequest, { params }: { params: { id: string, kind: string } }) {

    let profileFeed = await getProfileFeed(params.id, params.kind)

    if(profileFeed.error){
        return NextResponse.error()
    }

    return NextResponse.json(profileFeed.feed)
}
