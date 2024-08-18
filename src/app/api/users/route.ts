import { getUsers } from '@/actions/get-user';
import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const users = await getUsers()
    
    return NextResponse.json(users);
}
