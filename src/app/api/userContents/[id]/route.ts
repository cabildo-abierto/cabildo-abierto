import { NextRequest, NextResponse } from 'next/server';
import { getUserContents } from '../../../../actions/users';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let contents = await getUserContents(encodeURIComponent(params.id))

    return NextResponse.json(contents);
}
