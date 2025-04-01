import { NextRequest, NextResponse } from 'next/server';
import {getProfileFeed} from "@/server-actions/feed/profile";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string, kind: string }> }) {
    const {kind, id} = await params

    if(!["main", "replies", "edits"].includes(kind)){
        console.error(kind, "is not a valid profile feed kind")
        return NextResponse.error()
    }

    let profileFeed = await getProfileFeed(id, kind as "main" | "replies" | "edits")

    return NextResponse.json(profileFeed)
}
