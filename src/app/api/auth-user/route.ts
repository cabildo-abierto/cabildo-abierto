import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserAuthId } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const {name} = await getUserAuthId()

    return NextResponse.json({name})
}