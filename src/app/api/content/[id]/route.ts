import { getContentById } from '@/actions/get-content';
import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let content = await getContentById(params.id)

    return NextResponse.json(content);
}
