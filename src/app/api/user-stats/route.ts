import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getUserId, getUserStats } from 'src/actions/actions';

export async function GET(req: NextRequest) {

    let entities = await getUserStats(await getUserId())

    return NextResponse.json(entities);
}
