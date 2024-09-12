import { NextRequest, NextResponse } from 'next/server';
import { getDrafts } from '../../../actions/feed';
import { getUserId } from '../../../actions/users';

export async function GET(req: NextRequest) {

    let drafts = await getDrafts(await getUserId())

    return NextResponse.json(drafts);
}
