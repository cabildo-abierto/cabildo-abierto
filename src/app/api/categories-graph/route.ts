import { NextResponse } from 'next/server';
import {getCategoriesGraph} from "@/server-actions/topic/graph";


export async function GET() {

    let topics = await getCategoriesGraph()

    return NextResponse.json(topics)
}
