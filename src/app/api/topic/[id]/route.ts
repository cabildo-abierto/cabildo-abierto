import { NextRequest, NextResponse } from 'next/server';
import {getTopicById} from "../../../../actions/topic/topics";

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {
    let {topic} = await getTopicById(params.id)

    return NextResponse.json(topic ? topic : null);
}
