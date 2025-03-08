import { NextResponse } from 'next/server';
import { getDonationsDistribution } from '../../../actions/users';

export async function GET() {

    let fundingPercentage = await getDonationsDistribution()

    return NextResponse.json(fundingPercentage);
}
