
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const user = await getUserId()
    
    return NextResponse.json(user ? user : "no user")
    
}
