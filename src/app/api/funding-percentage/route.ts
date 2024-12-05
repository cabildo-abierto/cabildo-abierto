import { NextRequest, NextResponse } from 'next/server';
import { getFundingPercentage } from '../../../actions/users';

export async function GET(req: NextRequest) {

    let fundingPercentage = await getFundingPercentage()


    return NextResponse.json(fundingPercentage);
}
