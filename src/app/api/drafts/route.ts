import { NextRequest, NextResponse } from 'next/server';
import { getDrafts, getUserId } from 'src/actions/actions';

export async function GET(req: NextRequest) {

    let drafts = await getDrafts(await getUserId())

    return NextResponse.json(drafts);
}
