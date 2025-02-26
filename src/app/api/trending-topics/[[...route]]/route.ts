
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../actions/topics";


export async function GET(req: NextRequest,
    { params }: { params: { categories: string[] } }
) {

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    let {topics} = await getTrendingTopics(searchParams.get("since"), [], "popular", 10)

    return NextResponse.json(topics)
}
