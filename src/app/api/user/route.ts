import { getUser } from 'src/actions/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    const user = await getUser()

    return NextResponse.json(user)
    
}
