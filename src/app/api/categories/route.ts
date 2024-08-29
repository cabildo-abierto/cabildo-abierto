import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from 'src/actions/actions';

export async function GET(req: NextRequest) {

    let entities = await getCategories()

    return NextResponse.json(entities);
}
