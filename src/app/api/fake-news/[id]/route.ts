import { getContentViews, getFakeNewsCount } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let fakeNewsCount = await getFakeNewsCount(params.id)
    return NextResponse.json(fakeNewsCount);
}
