import { getFeed } from '@/actions/get-content';
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

    let feed: SmallContentProps[] | null = await getFeed()

    return NextResponse.json(feed);
}
