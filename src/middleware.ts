import { NextResponse, type NextRequest } from 'next/server'


const contentRedirectMap: Record<string, string> = {
    "app.bsky.feed.post": "post",
    "ar.cabildoabierto.feed.article": "article",
    "ar.cabildoabierto.data.dataset": "dataset",
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Split path segments
    const segments = url.pathname.split("/").filter(Boolean);
    // Example: /c/abc/p/xyz → ["c", "abc", "p", "xyz"]

    if (segments.length == 4 && segments[0] == "c") {
        const did = segments[1];
        const collection = segments[2];
        const rkey = segments[3];

        if (contentRedirectMap[collection]) {
            url.pathname = `/c/${did}/${contentRedirectMap[collection]}/${rkey}`;
            return NextResponse.redirect(url);
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