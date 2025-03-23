import {NextRequest, NextResponse} from "next/server";
import {restartSync, syncAllUsers} from "../../../../actions/sync/sync-user";
import {getUsers} from "../../../../actions/user/users";


export async function GET(req: NextRequest) {

    const authHeader = req.headers.get("Authentication")

    if (!authHeader || authHeader !== `Bearer ${process.env.CA_SYNC_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await restartSync()

    const {users} = await getUsers()
    console.log("users", users.map(u => [u.did, u.handle, u.inCA]))

    syncAllUsers()

    return NextResponse.json({ status: 200, users: users.map(u => u.did) });
}