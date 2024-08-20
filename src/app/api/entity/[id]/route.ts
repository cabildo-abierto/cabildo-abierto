import { getEntityById } from '@/actions/get-entity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getEntityById(encodeURIComponent(params.id))

    return NextResponse.json(entity);
}
