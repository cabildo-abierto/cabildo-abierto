import { NextRequest, NextResponse } from 'next/server';
import {getTopicVersionAuthors} from "../../../../../actions/topic/topics";
import {getUri} from "../../../../../components/utils/uri";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ did: string, rkey: string }> }
) {
    const {did, rkey} = await params
    let res = await getTopicVersionAuthors(getUri(did, "ar.com.cabildoabierto.topic", rkey))

    return NextResponse.json(res);
}
