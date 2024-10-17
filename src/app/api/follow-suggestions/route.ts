import { NextRequest, NextResponse } from 'next/server';
import { getUserFollowSuggestions, getUserId } from '../../../actions/users';

export async function GET(req: NextRequest) {

    const suggestions = await getUserFollowSuggestions(await getUserId())
    return NextResponse.json(suggestions != null ? suggestions : null)

}




