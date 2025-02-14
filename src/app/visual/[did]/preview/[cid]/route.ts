import { NextRequest, NextResponse } from 'next/server'
import {getUri} from "../../../../../components/utils";
import {fetchBlob} from "../../../../../actions/data";

export async function GET(req: NextRequest,
                          { params }: { params: { did: string, cid: string } }
) {

    // TO DO: No debería traer un blob cualquiera esto, solo debería funcionar para previews
    let data = await fetchBlob({authorId: params.did, cid: params.cid})

    return data
    return NextResponse.json(data);
}
