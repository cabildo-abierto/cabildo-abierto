
import { NextRequest, NextResponse } from 'next/server';
import {getDataset} from "../../../../../actions/data";


export async function GET(req: NextRequest, { params }: { params: { did: string, rkey: string } }) {


    let dataset = await getDataset("at://"+params.did+"/ar.com.cabildoabierto.dataset/"+params.rkey)

    return NextResponse.json(dataset)
}
