import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const {user, error} = await getUser()

    if(error){
        return NextResponse.json({error: error})
    }

    return NextResponse.json(user ? user : {status: "not logged in"})
    
}
