import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPoolSize } from '../../../actions/users';

export async function GET(req: NextRequest) {

    let {poolSize, error} = await getSubscriptionPoolSize()

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(poolSize);
}
