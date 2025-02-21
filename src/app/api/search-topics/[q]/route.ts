
import { NextRequest, NextResponse } from 'next/server';
import {searchTopics} from "../../../../actions/topics";


export async function GET(req: NextRequest,
                          { params }: { params: { q: string } }
) {

    let topics = await searchTopics(params.q)

    return NextResponse.json(topics)
}
