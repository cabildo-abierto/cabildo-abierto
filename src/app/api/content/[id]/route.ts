import { getContentById } from '../../../../actions/contents';
import { getUserId } from '../../../../actions/users';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  const { content, error } = await getContentById(params.id, userId);

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json(content);
}