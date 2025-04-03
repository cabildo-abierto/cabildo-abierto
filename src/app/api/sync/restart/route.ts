import {NextRequest, NextResponse} from "next/server";
import {restartSync, syncAllUsers} from "@/server-actions/sync/sync-user";
import {getUsers} from "@/server-actions/user/users";


export async function GET(req: NextRequest) {

    const authHeader = req.headers.get("Authentication")

    if (!authHeader || authHeader !== `Bearer ${process.env.CA_SYNC_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await restartSync()

    const {users} = await getUsers()

    syncAllUsers()

    return NextResponse.json({ status: 200, users: users.map(u => u.did) });
}