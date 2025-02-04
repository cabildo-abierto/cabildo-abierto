
import { NextRequest, NextResponse } from 'next/server';
import { getBskyUser } from '../../../../actions/users';

export async function GET(req: NextRequest) {

    const user = await getBskyUser()
    
    return NextResponse.json(user)
    
}
