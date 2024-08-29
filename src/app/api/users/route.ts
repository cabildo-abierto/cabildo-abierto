import { getUsers } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const users = await getUsers()
    
    return NextResponse.json(users);
}
