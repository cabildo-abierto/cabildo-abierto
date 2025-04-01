
import { NextRequest, NextResponse } from 'next/server';
import {getVisualization} from "@/server-actions/visualization/read";


export async function GET(req: NextRequest, { params }: { params: Promise<{ did: string, rkey: string }> }) {
    const {did, rkey} = await params

    let v = await getVisualization(
        "at://"+did+"/ar.com.cabildoabierto.visualization/"+rkey
    )
    return NextResponse.json(v)
}
