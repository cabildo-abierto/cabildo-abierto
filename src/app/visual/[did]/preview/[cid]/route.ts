import { NextRequest, NextResponse } from 'next/server'
import { fetchBlob } from "../../../../../actions/data";

export async function GET(req: NextRequest, { params }: { params: { did: string, cid: string } }) {
    const response = await fetchBlob({ authorId: params.did, cid: params.cid });

    if (!response || !response.ok) {
        return new NextResponse("Not found", { status: 404 });
    }

    const contentType = response.headers.get("Content-Type") || "image/png";
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(new Uint8Array(imageBuffer), {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
