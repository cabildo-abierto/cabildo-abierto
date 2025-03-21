import { NextRequest, NextResponse } from 'next/server';
import {getTopicHistory} from "../../../../actions/topic/topics";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const {id} = await params
    let topicHistory = await getTopicHistory(id)

    return NextResponse.json(topicHistory);
}
