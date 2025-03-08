
import { NextRequest, NextResponse } from 'next/server';
import {searchTopics} from "../../../../actions/feed/search";


export async function GET(req: NextRequest,
                          { params }: { params: Promise<{ q: string }> }
) {
    const {q} = await params

    let topics = await searchTopics(q)

    return NextResponse.json(topics)
}
