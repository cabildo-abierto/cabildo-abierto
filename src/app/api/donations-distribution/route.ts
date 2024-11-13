import { NextRequest, NextResponse } from 'next/server';
import { getDonationsDistribution } from '../../../actions/users';

export async function GET(req: NextRequest) {

    let fundingPercentage = await getDonationsDistribution()

    return NextResponse.json(fundingPercentage);
}
