import { NextRequest, NextResponse } from 'next/server';
import { getChatBetween, getUserId } from '../../../../../actions/users';


function hasAccess(loggedInUser: string, userId: string){
    if(loggedInUser == "tomas" && userId == "soporte"){
        return true
    }
    return loggedInUser == userId
}


export async function GET(req: NextRequest,
  { params }: { params: { id: string, idTo: string } }
) {

    if(!hasAccess(await getUserId(), params.id)){
      return NextResponse.json(null)
    }

    let chat = await getChatBetween(params.id, params.idTo)
    return NextResponse.json(chat);
}
