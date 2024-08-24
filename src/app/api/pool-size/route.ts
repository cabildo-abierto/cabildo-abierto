import { getSubscriptionPoolSize } from '@/actions/subscriptions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    let poolSize = await getSubscriptionPoolSize()

    return NextResponse.json(poolSize);
}
