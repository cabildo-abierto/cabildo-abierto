import { getFollowingFeed, getUserId } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    let feed = await getFollowingFeed(await getUserId())

    return NextResponse.json(feed);
}
