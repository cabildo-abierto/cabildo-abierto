
import { NextResponse } from 'next/server';
import { getBskyUser } from '../../../../actions/user/users';

export async function GET() {

    const user = await getBskyUser()
    
    return NextResponse.json(user)
    
}
