import { NextRequest, NextResponse } from 'next/server';
import { getUserId, getUserStats } from '../../../actions/users';

export async function GET(req: NextRequest) {

    let entities = await getUserStats(await getUserId())

    return NextResponse.json(entities);
}
