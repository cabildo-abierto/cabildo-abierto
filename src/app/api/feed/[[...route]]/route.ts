import { getRouteFeed } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';
import { SmallContentProps } from 'src/app/lib/definitions';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const route = params.route ? params.route.map(decodeURIComponent) : []
    let feed: SmallContentProps[] | null = await getRouteFeed(route)

    return NextResponse.json(feed);
}
