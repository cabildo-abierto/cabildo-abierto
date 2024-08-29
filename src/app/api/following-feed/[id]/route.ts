import { getFollowingFeed } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let feed = await getFollowingFeed(params.id)

    return NextResponse.json(feed);
}
