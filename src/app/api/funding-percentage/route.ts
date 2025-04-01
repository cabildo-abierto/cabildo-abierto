import { NextResponse } from 'next/server';
import { getFundingPercentage } from '@/server-actions/user/users';

export async function GET() {

    let fundingPercentage = await getFundingPercentage()


    return NextResponse.json(fundingPercentage);
}
