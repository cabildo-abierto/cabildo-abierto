import { NextRequest, NextResponse } from 'next/server';
import {getCategoryGraph} from "../../../../actions/topic/topics";


export async function GET(req: NextRequest, {params}: { params: {
        c: string
    }}) {

    let topics = await getCategoryGraph(params.c)

    return NextResponse.json(topics)
}
