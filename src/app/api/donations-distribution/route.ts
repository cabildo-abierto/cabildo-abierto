import { NextResponse } from 'next/server';
import { getDonationsDistribution } from '../../../actions/user/users';

export async function GET() {

    let fundingPercentage = await getDonationsDistribution()

    return NextResponse.json(fundingPercentage);
}
