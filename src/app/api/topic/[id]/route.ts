import { NextRequest, NextResponse } from 'next/server';
import {getTopicById} from "@/server-actions/topic/topics";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const {id} = await params
    let {topic} = await getTopicById(id)

    return NextResponse.json(topic ? topic : null);
}
