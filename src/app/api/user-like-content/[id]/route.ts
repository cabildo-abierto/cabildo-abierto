import { getUserId, userLikesContent } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let does = await userLikesContent(params.id, await getUserId())
    return NextResponse.json(does);
}
