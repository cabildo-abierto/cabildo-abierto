
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../../../actions/topic/topics";
import {TopicSortOrder} from "../../../../../lib/definitions";


export async function GET(req: NextRequest,
    { params }: { params: { sincekind: string, sortedby: string, categories: string[] } }
) {

    if(!["recent", "popular"].includes(params.sortedby)){
        return NextResponse.json(null)
    }

    let {topics} = await getTrendingTopics(params.categories ? params.categories : [], params.sortedby as TopicSortOrder, 50)

    return NextResponse.json(topics)
}
