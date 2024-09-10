import { getEntityChildrenCount } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let content = await getEntityChildrenCount(encodeURIComponent(params.id))
    return NextResponse.json(content);
}
