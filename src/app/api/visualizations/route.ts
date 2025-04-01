
import { NextResponse } from 'next/server';
import {getVisualizations} from "@/server-actions/visualization/read";


export async function GET() {

    let datasets = await getVisualizations()

    return NextResponse.json(datasets)
}
