import { NextRequest, NextResponse } from 'next/server';
import { getUserFollowSuggestions, getUserId } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const {suggestions, error} = await getUserFollowSuggestions(await getUserId())

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
    
    return NextResponse.json(suggestions != null ? suggestions : null)

}




