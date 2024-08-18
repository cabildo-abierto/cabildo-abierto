import { getUserById, getUserId } from '@/actions/get-user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    const userId = await getUserId()
    
    return NextResponse.json(userId ? await getUserById(userId) : undefined);
}
