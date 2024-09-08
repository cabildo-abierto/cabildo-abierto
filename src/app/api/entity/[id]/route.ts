import { NextRequest, NextResponse } from 'next/server';
import { getEntityById } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getEntityById(encodeURIComponent(params.id))

    return NextResponse.json(entity);
}
