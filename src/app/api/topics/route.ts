import { NextRequest, NextResponse } from 'next/server';
import {getFullTopicList} from "../../../actions/feed/search";


export async function GET(req: NextRequest) {

    let topics = await getFullTopicList()

    return NextResponse.json(topics)
}
