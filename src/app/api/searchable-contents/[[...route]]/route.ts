
import { NextRequest, NextResponse } from 'next/server';
import { getSearchableContents } from '../../../../actions/feed';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    let feed = await getSearchableContents()

    if(feed.error){
        return NextResponse.error()
    }

    return NextResponse.json(feed.feed);
}
