import { NextRequest, NextResponse } from 'next/server';
import { getEntityById } from '../../../../actions/entities';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let {entity, error} = await getEntityById(encodeURIComponent(params.id))

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(entity);
}
