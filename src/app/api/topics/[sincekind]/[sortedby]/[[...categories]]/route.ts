
import { NextRequest, NextResponse } from 'next/server';
import {getTrendingTopics} from "../../../../../../actions/topics";


export async function GET(req: NextRequest,
    { params }: { params: { sincekind: string, sortedby: string, categories: string[] } }
) {

    let {topics} = await getTrendingTopics(params.categories ? params.categories : [], params.sortedby, 50)

    return NextResponse.json(topics)
}
