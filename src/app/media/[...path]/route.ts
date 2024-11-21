import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    // Get the path from the URL (joined into a string)
    const path = params.path.join('/');

    if (!path) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Construct the Supabase URL
    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL+`/storage/v1/object/public/pictures/public/${path}`;

    // Fetch the resource from Supabase
    const response = await fetch(supabaseURL);

    if (!response.ok) {
        return NextResponse.json({ error: 'File not found' }, { status: response.status });
    }

    // Stream the file to the client
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Caching for performance
    return new NextResponse(response.body, {
        headers,
        status: response.status,
    });
}
