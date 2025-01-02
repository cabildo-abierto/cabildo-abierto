
import { NextRequest, NextResponse } from 'next/server';
import {getTopics} from "../../../../../actions/topics";
import {getDataset, getDatasets} from "../../../../../actions/data";


export async function GET(req: NextRequest, { params }: { params: { did: string, rkey: string } }) {


    let dataset = await getDataset("at://"+params.did+"/ar.com.cabildoabierto.dataset/"+params.rkey)

    return NextResponse.json(dataset)
}
