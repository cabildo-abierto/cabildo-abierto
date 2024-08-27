import { getContentViews } from '@/actions/get-content';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let views = await getContentViews(params.id)
    return NextResponse.json(views);
}
