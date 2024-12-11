
import { NextRequest, NextResponse } from 'next/server';
import {getTopics} from "../../../../actions/topics";


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    //const route = params.route ? params.route.map(decodeURIComponent) : []

    let {topics} = await getTopics([])

    return NextResponse.json(topics)
}
