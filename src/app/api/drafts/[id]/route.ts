import { NextRequest, NextResponse } from 'next/server';
import { getDrafts } from 'src/actions/actions';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let drafts = await getDrafts(params.id)

    return NextResponse.json(drafts);
}
