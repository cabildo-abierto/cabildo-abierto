import { NextRequest, NextResponse } from 'next/server';
import { getSupportNotRespondedCount, getUser } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const {user} = await getUser()

    if(!user || user.editorStatus != "Administrator"){
        return NextResponse.json({ error: "Not enough permissions" }, { status: 500 })
    }

    return NextResponse.json(await getSupportNotRespondedCount())
}
