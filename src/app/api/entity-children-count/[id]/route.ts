import { NextRequest, NextResponse } from 'next/server';
import { getEntityChildrenCount } from '../../../../actions/entities';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let content = await getEntityChildrenCount(encodeURIComponent(params.id))
    return NextResponse.json(content);
}
