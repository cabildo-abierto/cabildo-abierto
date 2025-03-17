
import { NextResponse } from 'next/server';
import { getUser } from '../../../actions/user/users';

export async function GET() {

    const user = await getUser()
    
    return NextResponse.json(user)
    
}
