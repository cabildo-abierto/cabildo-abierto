
import { NextRequest, NextResponse } from 'next/server';
import { getRouteFeed } from '../../../../actions/feed';
import { getUserId } from '../../../../actions/users';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const route = params.route ? params.route.map(decodeURIComponent) : []
    let feed = await getRouteFeed(route, await getUserId())

    return NextResponse.json(feed);
}
