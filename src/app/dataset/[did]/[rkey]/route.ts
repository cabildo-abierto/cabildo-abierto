import { NextRequest, NextResponse } from 'next/server'
import {getDatasetNoCache} from "../../../../actions/data";
import {getUri} from "../../../../components/utils/utils";


export async function GET(req: NextRequest,
                          { params }: { params: Promise<{ did: string, rkey: string }> }
) {
    const {did, rkey} = await params

    const uri = getUri(did, "ar.com.cabildoabierto.dataset", rkey)
    let data = await getDatasetNoCache(uri)

    return NextResponse.json(data.data);
}
