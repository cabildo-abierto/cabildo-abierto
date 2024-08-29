import { userLikesContent } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string, userId: string } }
) {

    let does = await userLikesContent(params.id, params.userId)
    return NextResponse.json(does);
}
