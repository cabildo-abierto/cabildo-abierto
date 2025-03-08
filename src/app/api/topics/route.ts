import { NextResponse } from 'next/server';
import {getFullTopicList} from "../../../actions/feed/search";


export async function GET() {

    let topics = await getFullTopicList()

    return NextResponse.json(topics)
}
