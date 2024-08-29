import { getContentReactions } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let views = await getContentReactions(params.id)
    return NextResponse.json(views);
}
