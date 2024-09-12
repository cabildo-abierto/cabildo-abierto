
import { NextRequest, NextResponse } from 'next/server';
import { getRouteFollowingFeed } from '../../../../actions/feed';

export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const route = params.route ? params.route.map(decodeURIComponent) : []
    let feed = await getRouteFollowingFeed(route)

    return NextResponse.json(feed);
}
