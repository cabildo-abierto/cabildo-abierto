import { getEntities } from '@/actions/get-entity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    let entities = await getEntities()

    return NextResponse.json(entities);
}
