import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPoolSize } from 'src/actions/actions';

export async function GET(req: NextRequest) {

    let poolSize = await getSubscriptionPoolSize()

    return NextResponse.json(poolSize);
}
