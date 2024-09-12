
import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '../../../actions/users';

export async function GET(req: NextRequest) {
    const users = await getUsers()
    
    return NextResponse.json(users);
}
