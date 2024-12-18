
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../actions/topics";


export async function GET(req: NextRequest,
    { params }: { params: { route: string[], since: string } }
) {
    //const route = params.route ? params.route.map(decodeURIComponent) : []

    let {topics} = await getTrendingTopics(new Date(params.since))

    return NextResponse.json(topics)
}
