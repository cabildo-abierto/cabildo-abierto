
import { NextRequest, NextResponse } from 'next/server';
import {getTopics} from "../../../../actions/topics";
import {getDataset, getDatasets} from "../../../../actions/data";


export async function GET(req: NextRequest, { params }: { params: { cid: string } }) {

    let dataset = await getDataset(params.cid)

    return NextResponse.json(dataset)
}
