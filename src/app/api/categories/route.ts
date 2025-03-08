
import { NextRequest, NextResponse } from 'next/server';
import {getCategories} from "../../../actions/topic/topics";


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    //const route = params.route ? params.route.map(decodeURIComponent) : []

    let categories = await getCategories()

    return NextResponse.json(categories)
}
