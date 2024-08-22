import { getCategories } from '@/actions/get-entity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    let entities = await getCategories()

    return NextResponse.json(entities);
}
