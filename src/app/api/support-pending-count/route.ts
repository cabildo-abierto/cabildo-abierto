import { NextResponse } from 'next/server';
import { getSupportNotRespondedCount } from '@/server-actions/user/users';

export async function GET() {

    return NextResponse.json(await getSupportNotRespondedCount())
}
