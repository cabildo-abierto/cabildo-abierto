
import { NextRequest, NextResponse } from 'next/server';
import {getEnDiscusion} from '../../../../actions/feed';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    //const route = params.route ? params.route.map(decodeURIComponent) : []

    let feed = await getEnDiscusion()

    return NextResponse.json(feed)
}
