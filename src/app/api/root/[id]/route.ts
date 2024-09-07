import { getRootContent } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let content = await getRootContent(params.id)
    return NextResponse.json(content);
}
