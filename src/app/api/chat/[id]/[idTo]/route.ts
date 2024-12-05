import { NextRequest, NextResponse } from 'next/server';
import { getChatBetween, getUserId } from '../../../../../actions/users';
import { supportDid, tomasDid } from '../../../../../components/utils';


function hasAccess(loggedInUser: string, userId: string){
    if(loggedInUser == tomasDid && userId == supportDid){
        return true
    }
    return loggedInUser == userId
}


export async function GET(req: NextRequest,
  { params }: { params: { id: string, idTo: string } }
) {

    const userId = await getUserId()

    if(!hasAccess(userId, params.id)){
      return NextResponse.json(null)
    }

    let chat = await getChatBetween(params.id, params.idTo)
    return NextResponse.json(chat);
}
