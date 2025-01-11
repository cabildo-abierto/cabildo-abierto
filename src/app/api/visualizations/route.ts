
import { NextRequest, NextResponse } from 'next/server';
import {getVisualizations} from "../../../actions/data";


export async function GET(req: NextRequest) {

    let datasets = await getVisualizations()

    return NextResponse.json(datasets)
}
