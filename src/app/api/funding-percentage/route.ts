import { NextResponse } from 'next/server';
import { getFundingPercentage } from '../../../actions/users';

export async function GET() {

    let fundingPercentage = await getFundingPercentage()


    return NextResponse.json(fundingPercentage);
}
