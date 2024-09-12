import { NextRequest, NextResponse } from 'next/server';
import { getEntityComments } from '../../../../actions/entities';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getEntityComments(encodeURIComponent(params.id))

    return NextResponse.json(entity);
}
