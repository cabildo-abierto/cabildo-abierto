
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../actions/topics";


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    //const route = params.route ? params.route.map(decodeURIComponent) : []

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    let {topics} = await getTrendingTopics(searchParams.get("since"), [], 10, "popular")

    return NextResponse.json(topics)
}
