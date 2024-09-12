import { NextRequest, NextResponse } from 'next/server';
import { getRepliesFeed } from '../../../../actions/feed';

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    let feed: {id: string}[] | null = await getRepliesFeed(params.id)

    return NextResponse.json(feed);
}
