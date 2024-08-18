import { ContentProps } from '@/actions/get-content';
import { EntityProps } from '@/actions/get-entity';
import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    let entities: EntityProps[] | null = await db.entity.findMany({
        select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            versions: {
                select: {
                    id: true,
                    categories: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    return NextResponse.json(entities);
}
