import { NextRequest, NextResponse } from 'next/server'
import {getDataset} from "../../../actions/data";

export async function GET(req: NextRequest,
                          { params }: { params: { cid: string } }
) {

    let data = await getDataset(params.cid)

    return NextResponse.json(data);
}
