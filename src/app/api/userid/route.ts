
import { NextRequest, NextResponse } from 'next/server';
import {getSessionDid} from "../../../actions/auth";

export async function GET(req: NextRequest) {

    const user = await getSessionDid()
    
    return NextResponse.json(user ? user : "no user")
    
}
