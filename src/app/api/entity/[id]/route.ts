import { ContentProps } from '@/actions/get-content';
import { EntityProps } from '@/actions/get-entity';
import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
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
        },
            where: {
                id: params.id,
            }
        }
    )

    return NextResponse.json(entity);
}
