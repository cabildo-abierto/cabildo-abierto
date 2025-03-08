
import { NextRequest, NextResponse } from 'next/server';
import {getDatasetNoCache} from "../../../../../actions/data";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let dataset = await getDatasetNoCache("at://"+did+"/ar.com.cabildoabierto.dataset/"+rkey)

    return NextResponse.json(dataset)
}
