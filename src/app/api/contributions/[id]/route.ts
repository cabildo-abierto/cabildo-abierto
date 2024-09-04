import { NextRequest, NextResponse } from 'next/server';
import { getEntityById, getEntityContributions } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let contributions = await getEntityContributions(encodeURIComponent(params.id))

    return NextResponse.json(contributions);
}
