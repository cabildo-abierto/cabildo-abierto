import { NextRequest, NextResponse } from 'next/server';
import {getTopicsByCategories} from "../../../../actions/topics";


export async function GET(req: NextRequest, {params}: {params: {sortedby: string}}) {

    let topics = await getTopicsByCategories(params.sortedby)

    return NextResponse.json(topics)
}
