
import { NextRequest, NextResponse } from 'next/server';
import {getTopics} from "../../../../../actions/topics";
import {getDataset, getDatasets, getVisualization} from "../../../../../actions/data";


export async function GET(req: NextRequest, { params }: { params: { did: string, rkey: string } }) {

    let v = await getVisualization("at://"+params.did+"/ar.com.cabildoabierto.visualization/"+params.rkey)
    return NextResponse.json(v)
}
