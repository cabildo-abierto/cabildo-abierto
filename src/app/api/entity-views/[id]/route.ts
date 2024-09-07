import { NextRequest, NextResponse } from 'next/server';
import { getEntityViews } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let reactions = await getEntityViews(params.id)

    return NextResponse.json(reactions);
}
