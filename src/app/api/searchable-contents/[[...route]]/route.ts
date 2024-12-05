
import { NextRequest, NextResponse } from 'next/server';
//import { getSearchableContents } from '../../../../actions/feed';
import { getUserId } from '../../../../actions/users';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    //const route = params.route ? params.route.map(decodeURIComponent) : []
    //let feed = await getSearchableContents(route, await getUserId())

    return NextResponse.json([]);
}
