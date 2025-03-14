
import { NextRequest, NextResponse } from 'next/server';
import {getDataset} from "../../../../../actions/dataset/read";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let dataset = await getDataset("at://"+did+"/ar.com.cabildoabierto.dataset/"+rkey)

    return NextResponse.json(dataset)
}
