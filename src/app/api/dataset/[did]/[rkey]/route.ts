
import { NextRequest, NextResponse } from 'next/server';
import {getDataset, getDatasetNoCache} from "../../../../../actions/data";


export async function GET(req: NextRequest, { params }: { params: { did: string, rkey: string } }) {


    let dataset = await getDatasetNoCache("at://"+params.did+"/ar.com.cabildoabierto.dataset/"+params.rkey)

    return NextResponse.json(dataset)
}
