
import { NextResponse } from 'next/server';
import { getBskyUser } from '@/server-actions/user/users';

export async function GET() {

    const user = await getBskyUser()
    
    return NextResponse.json(user)
    
}
