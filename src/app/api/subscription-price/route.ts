import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPrice } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const user = await getSubscriptionPrice()
    return NextResponse.json(user ? user : null)
    
}
