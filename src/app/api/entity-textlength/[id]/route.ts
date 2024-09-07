import { NextRequest, NextResponse } from 'next/server';
import { getEntityTextLength } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getEntityTextLength(params.id)

    return NextResponse.json(entity);
}
