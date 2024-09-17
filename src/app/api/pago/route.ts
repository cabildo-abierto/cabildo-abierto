import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
    console.log("got a payment!");
    console.log("request is", req)
    if (req.method === 'POST') {
        console.log("it was a post")
        console.log("body", req.body)
        console.log("parsed", JSON.parse(req.body))
        const { type, data } = JSON.parse(req.body);
    }

    return NextResponse.json({ status: 200 });
}