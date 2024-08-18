import { getDraftsById } from '@/actions/get-content';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let drafts = await getDraftsById(params.id)

    return NextResponse.json(drafts);
}
