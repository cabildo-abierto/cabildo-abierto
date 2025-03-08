import { NextRequest, NextResponse } from 'next/server';
import {getTopicsByCategories} from "../../../../actions/topic/topics";
import {TopicSortOrder} from "../../../lib/definitions";


export async function GET(req: NextRequest, {params}: {params: {sortedby: string}}) {

    if(!["recent", "popular"].includes(params.sortedby)){
        return NextResponse.json(null)
    }

    let topics = await getTopicsByCategories(params.sortedby as TopicSortOrder)

    return NextResponse.json(topics)
}
