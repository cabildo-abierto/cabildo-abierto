import { NextRequest, NextResponse } from 'next/server';
import { getSupportNotRespondedCount } from '../../../actions/users';

export async function GET(req: NextRequest) {

    return NextResponse.json(await getSupportNotRespondedCount())
}
