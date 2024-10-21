import { NextRequest, NextResponse } from 'next/server';
import { getRouteEntities } from '../../../../actions/entities';


export async function GET(req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const route = params.route ? params.route.map(decodeURIComponent) : []
    let {entities, error} = await getRouteEntities(route)

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }
    
    return NextResponse.json(entities);
}
