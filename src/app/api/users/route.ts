
import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '../../../actions/users';

export async function GET(req: NextRequest) {
    const {users, error} = await getUsers()
    
    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(users);
}
