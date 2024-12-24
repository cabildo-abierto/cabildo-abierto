
import { NextRequest, NextResponse } from 'next/server';
import {getTopics} from "../../../actions/topics";
import {getDatasets} from "../../../actions/data";


export async function GET(req: NextRequest) {

    let datasets = await getDatasets()

    return NextResponse.json(datasets)
}
