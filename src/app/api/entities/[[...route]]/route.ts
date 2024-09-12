import { NextRequest, NextResponse } from 'next/server';
import { getRouteEntities } from '../../../../actions/entities';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const route = params.route ? params.route.map(decodeURIComponent) : []
    let entities = await getRouteEntities(route)

    return NextResponse.json(entities);
}
