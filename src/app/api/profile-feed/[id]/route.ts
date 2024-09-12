import { NextRequest, NextResponse } from 'next/server';
import { getProfileFeed } from '../../../../actions/feed';

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    let feed: {id: string}[] | null = await getProfileFeed(params.id)

    return NextResponse.json(feed);
}
