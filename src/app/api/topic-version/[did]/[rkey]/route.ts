import { NextRequest, NextResponse } from 'next/server'
import {getTopicVersion} from "../../../../../actions/topics";
import {getUri} from "../../../../../components/utils";

export async function GET(req: NextRequest,
    { params }: { params: { did: string, rkey: string } }
) {

    let {topic} = await getTopicVersion(getUri(params.did, "ar.com.cabildoabierto.topic", params.rkey))

    return NextResponse.json(topic ? topic : null);
}
