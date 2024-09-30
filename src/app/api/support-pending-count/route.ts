import { NextRequest, NextResponse } from 'next/server';
import { getSupportNotRespondedCount, getUser } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const user = await getUser()

    if(user.editorStatus != "Administrator"){
        return NextResponse.json(null)
    }

    return NextResponse.json(await getSupportNotRespondedCount())
}
