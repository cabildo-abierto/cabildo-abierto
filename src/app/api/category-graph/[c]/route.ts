import { NextRequest, NextResponse } from 'next/server';
import {getCategoryGraph} from "../../../../actions/topic/topics";


export async function GET(req: NextRequest, {params}: {
    params: Promise<{ c: string }>
}) {

    const {c} = await params

    let topics = await getCategoryGraph(c)

    return NextResponse.json(topics)
}
