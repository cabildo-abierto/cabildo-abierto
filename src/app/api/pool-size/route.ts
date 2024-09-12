import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPoolSize } from '../../../actions/users';

export async function GET(req: NextRequest) {

    let poolSize = await getSubscriptionPoolSize()

    return NextResponse.json(poolSize);
}
