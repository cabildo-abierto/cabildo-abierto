
import { NextRequest, NextResponse } from 'next/server';
import {getAvailableInviteCodes} from "@/server-actions/user/access";


export async function GET() {

    let codes = await getAvailableInviteCodes()

    return NextResponse.json(codes)
}
