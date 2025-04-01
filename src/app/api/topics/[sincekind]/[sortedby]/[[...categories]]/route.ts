
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "@/server-actions/topic/topics";
import {TopicSortOrder} from "@/lib/definitions";


export async function GET(_: NextRequest,
    { params }: { params: Promise<{ sincekind: string, sortedby: string, categories: string[] }> }
) {
    const {sortedby, categories} = await params

    if(!["recent", "popular"].includes(sortedby)){
        return NextResponse.json(null)
    }

    let {topics} = await getTrendingTopics(categories ? categories : [], sortedby as TopicSortOrder, 50)

    return NextResponse.json(topics)
}
