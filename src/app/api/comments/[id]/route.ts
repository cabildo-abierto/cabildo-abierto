
import { NextRequest, NextResponse } from 'next/server';
import { getContentComments } from '../../../../actions/contents';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let comments = await getContentComments(params.id)

    return NextResponse.json(comments);
}
