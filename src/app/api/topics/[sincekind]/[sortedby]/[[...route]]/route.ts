
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../../../actions/topics";


export async function GET(req: NextRequest,
    { params }: { params: { sincekind: string, sortedby: string, route: string[] } }
) {

    let {topics} = await getTrendingTopics(params.sincekind, params.route ? params.route : [], 50, params.sortedby)

    return NextResponse.json(topics)
}
