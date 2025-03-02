import { NextRequest, NextResponse } from 'next/server';
import {getProfileFeed} from "../../../../../actions/feed/profile";


export async function GET(req: NextRequest, { params }: { params: { id: string, kind: string } }) {

    if(!["main", "replies", "edits"].includes(params.kind)){
        console.error(params.kind, "is not a valid profile feed kind")
        return NextResponse.error()
    }

    let profileFeed = await getProfileFeed(params.id, params.kind as "main" | "replies" | "edits")

    return NextResponse.json(profileFeed)
}
