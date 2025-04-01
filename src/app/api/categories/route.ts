
import { NextResponse } from 'next/server';
import {getCategories} from "@/server-actions/topic/topics";


export async function GET() {

    let categories = await getCategories()

    return NextResponse.json(categories)
}
