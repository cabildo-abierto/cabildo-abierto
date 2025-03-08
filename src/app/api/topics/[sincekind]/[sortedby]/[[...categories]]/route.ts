
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../../../actions/topic/topics";
import {TopicSortOrder} from "../../../../../lib/definitions";


export async function GET(req: NextRequest,
    { params }: { params: Promise<{ sincekind: string, sortedby: string, categories: string[] }> }
) {
    const {sincekind, sortedby, categories} = await params

    if(!["recent", "popular"].includes(sortedby)){
        return NextResponse.json(null)
    }

    let {topics} = await getTrendingTopics(categories ? categories : [], sortedby as TopicSortOrder, 50)

    return NextResponse.json(topics)
}
