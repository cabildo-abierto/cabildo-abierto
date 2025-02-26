import { NextRequest, NextResponse } from 'next/server';
import {getTopicsForVisualization} from "../../../actions/topics";


export async function GET(req: NextRequest) {

    let topics = await getTopicsForVisualization()

    return NextResponse.json(topics)
}
