
import { NextRequest, NextResponse } from 'next/server';
import {getDataset} from "@/server-actions/dataset/read";
import {getUri} from "@/utils/uri";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let dataset = await getDataset(getUri(did, "ar.com.cabildoabierto.topic", rkey))

    return NextResponse.json(dataset)
}
