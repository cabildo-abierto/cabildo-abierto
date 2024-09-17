import { NextRequest, NextResponse } from 'next/server';
import { buyAndUseSubscription } from '../../../actions/users';

export async function POST(req) {
    const json = await req.json()

    const userId = json.metadata.userId

    await buyAndUseSubscription(userId)

    return NextResponse.json({ status: 200 });
}