import { NextResponse } from 'next/server';
import { getSubscriptionPrice } from '@/server-actions/payments';

export async function GET() {

    const user = await getSubscriptionPrice()

    return NextResponse.json(user)
}
