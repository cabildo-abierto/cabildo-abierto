import { NextRequest, NextResponse } from 'next/server';
import { getEntityReactions } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let reactions = await getEntityReactions(encodeURIComponent(params.id))

    return NextResponse.json(reactions);
}
