
import { NextRequest, NextResponse } from 'next/server';
import {getThread} from "../../../../../actions/thread/thread";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {

    let thread = await getThread(await params)
    console.log("thread in route", thread)
    return NextResponse.json(thread)
}
