import { NextRequest, NextResponse } from 'next/server';
import {getCategoriesGraph} from "../../../actions/topic/topics";


export async function GET(req: NextRequest) {

    let topics = await getCategoriesGraph()

    return NextResponse.json(topics)
}
