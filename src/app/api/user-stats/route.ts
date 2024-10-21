import { NextRequest, NextResponse } from 'next/server';
import { getUserId, getUserStats } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const userId = await getUserId()
    if(!userId){
        return NextResponse.json({ error: "not logged in" }, { status: 500 })
    }

    let {stats, error} = await getUserStats(userId)

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(stats);
}
