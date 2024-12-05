import { NextRequest, NextResponse } from 'next/server';
import { getLastKNotifications } from '../../../actions/contents';

export async function GET(req: NextRequest) {

    let notifications = await getLastKNotifications(10)

    return NextResponse.json(notifications);
}
