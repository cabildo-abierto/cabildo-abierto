import { ContentProps } from '@/actions/get-content';
import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

    let content = await db.content.findUnique({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: true,
            childrenComments: true,
            _count: {
                select: {
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true,
            isDraft: true,
            parentContentId: true,
            title: true,
            categories: true
        },
        where: {
            id: params.id,
        }
    })

    return NextResponse.json(content);
}
