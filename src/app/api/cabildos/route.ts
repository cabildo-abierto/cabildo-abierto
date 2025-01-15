
import { NextRequest, NextResponse } from 'next/server';
import {getCabildos} from "../../../actions/cabildos";


export async function GET(req: NextRequest) {

    let cabildos = await getCabildos()

    return NextResponse.json(cabildos)
}
