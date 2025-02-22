import { NextRequest, NextResponse } from 'next/server';
import {getTopicsForSearch} from "../../../actions/topics";


export async function GET(req: NextRequest) {

    let topics = await getTopicsForSearch()

    return NextResponse.json(topics)
}
