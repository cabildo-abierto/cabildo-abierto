import { NextRequest, NextResponse } from 'next/server';
import { getChatBetween } from '@/server-actions/user/users';
import {getSessionDid} from "@/server-actions/auth";
import {supportDid, tomasDid} from "../../../../../utils/auth";


function hasAccess(loggedInUser: string, userId: string){
    if(loggedInUser == tomasDid && userId == supportDid){
        return true
    }
    return loggedInUser == userId
}


export async function GET(req: NextRequest,
  { params }: { params: Promise<{ id: string, idTo: string }> }
) {

    const {id, idTo} = await params
    const userId = await getSessionDid()

    if(!hasAccess(userId, id)){
      return NextResponse.json(null)
    }

    let chat = await getChatBetween(id, idTo)
    return NextResponse.json(chat);
}
