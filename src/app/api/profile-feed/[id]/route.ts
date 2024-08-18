import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,
    { params }: { params: { id: string } }
) {

    let feed: {id: string}[] | null = await db.content.findMany({
        select: {
            id: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
                {authorId: params.id}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return NextResponse.json(feed);
}
