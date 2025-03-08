import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const {path: paramsPath} = await params
    const path = paramsPath.join('/')

    if (!path) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL+`/storage/v1/object/public/pictures/public/${path}`;

    const response = await fetch(supabaseURL)

    if (!response.ok) {
        return NextResponse.json({ error: 'File not found' }, { status: response.status })
    }

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Caching for performance
    return new NextResponse(response.body, {
        headers,
        status: response.status,
    });
}
