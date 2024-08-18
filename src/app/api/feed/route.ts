import { ContentProps } from '@/actions/get-content';
import { db } from '@/db';
import { ContentType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export type SmallContentProps = {
    id: string
    type: ContentType
    isDraft: boolean | null
    text: string
}

export async function GET(req: NextRequest) {

    let feed: SmallContentProps[] | null = await db.content.findMany({
        select: {
            id: true,
            type: true,
            isDraft: true,
            text: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return NextResponse.json(feed);
}
