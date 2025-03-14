import { NextRequest, NextResponse } from 'next/server'
import {getUri} from "../../../../components/utils/utils";
import {getDataset} from "../../../../actions/dataset/read";


export async function GET(req: NextRequest,
                          { params }: { params: Promise<{ did: string, rkey: string }> }
) {
    const {did, rkey} = await params

    const uri = getUri(did, "ar.com.cabildoabierto.dataset", rkey)
    let data = await getDataset(uri)

    return NextResponse.json(data.data);
}
