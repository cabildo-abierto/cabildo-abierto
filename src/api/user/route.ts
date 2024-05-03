import {verifySession} from "@/actions/auth";

export const dynamic = 'force-dynamic' // defaults to auto
import {db} from '@/db'

export async function GET(request: Request) {
    const session = await verifySession()
    if(!session) return Response.error()

    const user = await db.user.findUnique(
        {where: {id: session?.userId}}
    )

    return Response.json({ user })
}