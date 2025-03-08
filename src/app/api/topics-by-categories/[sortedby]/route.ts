import { NextRequest, NextResponse } from 'next/server';
import {getTopicsByCategories} from "../../../../actions/topic/topics";
import {TopicSortOrder} from "../../../lib/definitions";


export async function GET(req: NextRequest, {params}: {params: Promise<{sortedby: string}>}) {
    const {sortedby} = await params

    if(!["recent", "popular"].includes(sortedby)){
        return NextResponse.json(null)
    }

    let topics = await getTopicsByCategories(sortedby as TopicSortOrder)

    return NextResponse.json(topics)
}
