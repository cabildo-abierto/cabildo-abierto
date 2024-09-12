import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const user = await getUser()
    return NextResponse.json(user ? user : null)
    
}
