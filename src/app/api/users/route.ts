
import { NextResponse } from 'next/server';
import { getUsers } from '@/server-actions/user/users';

export async function GET() {
    const {users, error} = await getUsers()
    
    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(users);
}
