import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    //let feed = await getEditsFeed(params.id)

    return NextResponse.json([]);
}
