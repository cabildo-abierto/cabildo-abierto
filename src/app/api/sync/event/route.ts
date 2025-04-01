import {NextRequest, NextResponse} from "next/server";
import {processEvent} from "@/server-actions/sync/process-event";


export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("Authentication")

    if (!authHeader || authHeader !== `Bearer ${process.env.CA_SYNC_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json()

    processEvent(data)

    return NextResponse.json({ status: 200 });
}