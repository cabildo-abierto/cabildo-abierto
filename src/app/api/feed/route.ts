import { getFeed } from 'src/actions/actions';
import { db } from 'src/db';
import { ContentType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export type SmallContentProps = {
    id: string
    type: ContentType
    text: string
    entityReferences: {id: string, versions: {id: string, categories: string}[]}[]
}

export async function GET(req: NextRequest) {

    let feed: SmallContentProps[] | null = await getFeed()

    return NextResponse.json(feed);
}
