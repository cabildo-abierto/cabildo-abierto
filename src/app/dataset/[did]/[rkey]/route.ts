import { NextRequest, NextResponse } from 'next/server'
import {getDatasetNoCache} from "../../../../actions/data";
import {getUri} from "../../../../components/utils/utils";


export async function GET(req: NextRequest,
                          { params }: { params: { did: string, rkey: string } }
) {

    let data = await getDatasetNoCache(getUri(params.did, "ar.com.cabildoabierto.dataset", params.rkey))

    return NextResponse.json(data.data);
}
