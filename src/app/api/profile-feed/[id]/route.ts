import { NextRequest, NextResponse } from 'next/server';
import { getProfileFeed } from '../../../../actions/feed';

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    let feed = await getProfileFeed(params.id, false)

    return NextResponse.json(feed);
}
