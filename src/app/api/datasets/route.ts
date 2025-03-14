
import { NextRequest, NextResponse } from 'next/server';
import {getDatasets} from "../../../actions/dataset/read";


export async function GET() {

    let datasets = await getDatasets()

    return NextResponse.json(datasets)
}
