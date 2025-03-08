import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../actions/topic/topics";


export async function GET(req: NextRequest,
    { params }: { params: Promise<{ categories: string[] }> }
) {
    const {categories} = await params

    let {topics} = await getTrendingTopics(categories ? categories : [], "popular", 10)

    return NextResponse.json(topics)
}
