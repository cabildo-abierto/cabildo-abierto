import {AppContext} from "#/setup.js";
import {ReadChunks} from "#/services/monetization/read-tracking.js";
import {jsonArrayFrom} from "kysely/helpers/postgres";


function joinReadChunks(a: ReadChunks, b: ReadChunks): ReadChunks {
    const m = new Map<number, number>()
    a.forEach(c => {
        m.set(c.chunk, c.duration + (m.get(c.chunk) ?? 0))
    })
    b.forEach(c => {
        m.set(c.chunk, c.duration + (m.get(c.chunk) ?? 0))
    })
    return Array.from(m.entries()).map(([k, v]) => ({chunk: k, duration: v}))
}

export const FULL_READ_DURATION = 25

export function joinManyChunks(chunks: ReadChunks[]): ReadChunks {
    return chunks.reduce((acc, c) => joinReadChunks(acc, c))
}


export type UserWithReadSessions = {
    did: string
    handle: string
    months: {
        monthStart: Date
        monthEnd: Date
    }[]
    readSessions: {
        readContentId: string | null,
        readChunks: unknown
        created_at: Date
    }[]
}


export async function getUsersWithReadSessions(
    ctx: AppContext,
    after: Date = new Date(Date.now() - 60 * 24 * 3600 * 1000),
    verified: boolean = true
): Promise<UserWithReadSessions[]> {
    try {
        const users = await ctx.kysely
            .selectFrom("User")
            .select([
                "did",
                "handle",
                "userValidationHash",
                eb => jsonArrayFrom(eb
                    .selectFrom("UserMonth")
                    .whereRef("UserMonth.userId", "=", "User.did")
                    .select([
                        "monthStart",
                        "monthEnd"
                    ])
                    .orderBy("monthStart desc")
                ).as("months"),
                eb => jsonArrayFrom(eb
                    .selectFrom("ReadSession")
                    .whereRef("ReadSession.userId", "=", "User.did")
                    .select([
                        "readContentId",
                        "created_at",
                        "readChunks"
                    ])
                    .where("created_at", ">", after)
                    .orderBy("created_at asc")
                ).as("readSessions")
            ])
            .where("User.inCA", "=", true)
            .where("User.hasAccess", "=", true)
            .$if(verified, qb => qb.where("User.userValidationHash", "is not", null))
            .execute()

        const valid: UserWithReadSessions[] = []
        users.forEach(u => {
            if (u.handle != null) {
                valid.push({
                    ...u,
                    handle: u.handle
                })
            }
        })
        return valid
    } catch (err) {
        ctx.logger.pino.error({error: err}, "error getting users with read sessions")
        throw err
    }
}