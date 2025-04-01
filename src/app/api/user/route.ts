
import { NextResponse } from 'next/server';
import { getUser } from '@/server-actions/user/users';

export async function GET() {

    const user = await getUser()
    
    return NextResponse.json(user)
    
}
