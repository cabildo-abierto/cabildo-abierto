import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
    console.log("got a payment!");
    const json = await req.json()

    console.log("json", json)

    return NextResponse.json({ status: 200 });
}