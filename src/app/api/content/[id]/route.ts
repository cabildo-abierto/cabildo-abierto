import { NextRequest, NextResponse } from 'next/server';
import { getContentById } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getContentById(params.id)

    return NextResponse.json(entity);
}
