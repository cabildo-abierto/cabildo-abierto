
import { NextRequest, NextResponse } from 'next/server';
import {getThread} from "@/server-actions/thread/thread";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, c: string, rkey: string }> }) {
    let thread = await getThread(await params)
    return NextResponse.json(thread)
}
