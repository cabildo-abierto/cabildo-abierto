import { NextRequest, NextResponse } from 'next/server';
import { getEntityById, getUserContents } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let contents = await getUserContents(encodeURIComponent(params.id))

    return NextResponse.json(contents);
}
