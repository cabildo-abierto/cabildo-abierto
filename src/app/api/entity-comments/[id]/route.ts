import { NextRequest, NextResponse } from 'next/server';
import { getEntityComments } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getEntityComments(params.id)

    return NextResponse.json(entity);
}
