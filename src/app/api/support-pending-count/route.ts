import { NextResponse } from 'next/server';
import { getSupportNotRespondedCount } from '../../../actions/users';

export async function GET() {

    return NextResponse.json(await getSupportNotRespondedCount())
}
