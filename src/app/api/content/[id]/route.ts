import { NextRequest, NextResponse } from 'next/server';
import { getContentById } from '../../../../actions/contents';
import { getUserId } from '../../../../actions/users';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity = await getContentById(params.id, await getUserId())

    return NextResponse.json(entity);
}
