import { NextResponse, type NextRequest } from 'next/server'


const contentRedirectMap: Record<string, string> = {
    "app.bsky.feed.post": "post",
    "ar.cabildoabierto.feed.article": "article",
    "ar.cabildoabierto.data.dataset": "dataset",
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    const segments = url.pathname.split("/").filter(Boolean)

    if (segments.length == 4 && segments[0] == "c") {
        const did = segments[1];
        const collection = segments[2];
        const rkey = segments[3];

        if (contentRedirectMap[collection]) {
            url.pathname = `/c/${did}/${contentRedirectMap[collection]}/${rkey}`;
            return NextResponse.redirect(url);
        }
    }

    if(url.pathname.startsWith("/tema") && !url.pathname.startsWith("/temas")) {
        const searchParams = url.searchParams
        const did = searchParams.get("did")
        const rkey = searchParams.get("rkey")
        const topicId = searchParams.get("i")
        if(!topicId && (!did || !rkey)) {
            url.pathname = "/temas"
            return NextResponse.redirect(url)
        }
    }

    if(url.pathname.startsWith("/login") && !url.pathname.startsWith("/login/ok")) {
        url.pathname = "/presentacion"
        return NextResponse.redirect(url)
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}