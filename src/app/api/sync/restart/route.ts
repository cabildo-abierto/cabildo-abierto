import {NextRequest, NextResponse} from "next/server";
import {restartSync, syncAllUsers} from "../../../../actions/sync/sync-user";


export async function POST(req: NextRequest) {

    const authHeader = req.headers.get("Authentication")

    if (!authHeader || authHeader !== `Bearer ${process.env.CA_SYNC_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await restartSync()
    syncAllUsers()

    return NextResponse.json({ status: 200 });
}