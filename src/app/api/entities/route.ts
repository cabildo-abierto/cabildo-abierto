import { NextRequest, NextResponse } from 'next/server';
import { getEntities } from 'src/actions/actions';

export async function GET(req: NextRequest) {

    let entities = await getEntities()

    return NextResponse.json(entities);
}
