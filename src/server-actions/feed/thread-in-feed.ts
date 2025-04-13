"use server"
import {db} from "@/db";
import {getDidFromUri, getRkeyFromUri} from "@/utils/uri";


function makeThread(r: { uri: string, rootOf: { uri: string, replyTo: { uri: string } }[] }) {
    const authorReplies = r.rootOf.filter(rep => (getDidFromUri(rep.uri) == getDidFromUri(r.uri)))
    let thread: string[] = []
    for (let i = 0; i < authorReplies.length; i++) {
        const rep = authorReplies[i]
        if (rep.replyTo.uri == r.uri) {
            thread.push(rep.uri)
            break;
        }
    }
    if (thread.length > 0) {
        let foundNew = true
        while (foundNew) {
            foundNew = false
            for (let i = 0; i < authorReplies.length; i++) {
                const rep = authorReplies[i]
                if (rep.replyTo.uri == thread[thread.length - 1]) {
                    thread.push(rep.uri)
                    foundNew = true
                }
            }
        }
    }
    return thread
}


export async function updateThreadsInFeed() {
    let records = await db.record.findMany({
        select: {
            uri: true,
            authorId: true,
            rootOf: {
                select: {
                    uri: true,
                    replyTo: {
                        select: {
                            uri: true
                        }
                    }
                }
            }
        },
        where: {
            collection: {
                in: ["ar.com.cabildoabierto.quotePost", "app.bsky.feed.post", "ar.com.cabildoabierto.article"]
            },
            rootOf: {
                some: {}
            }
        }
    })

    await db.record.updateMany({
        data: {
            lastInThreadId: null,
            secondToLastInThreadId: null
        }
    })

    const threads = new Map<string, { lastInThread: string, secondToLastInThread?: string }>()

    for (let i = 0; i < records.length; i++) {
        const t = makeThread(records[i])
        if (t.length >= 2) {
            threads.set(records[i].uri, {lastInThread: t[t.length - 1], secondToLastInThread: t[t.length - 2]})
        } else if (t.length == 1) {
            threads.set(records[i].uri, {lastInThread: t[t.length - 1]})
        }
    }

    const entries = Array.from(threads.entries())

    console.log("Updating last in thread for", entries.length, "entries")
    for (let i = 0; i < entries.length; i++) {
        const [uri, {lastInThread, secondToLastInThread}] = entries[i]
        console.log("updating entry", i)
        await db.record.update({
            data: {
                lastInThreadId: lastInThread,
                secondToLastInThreadId: secondToLastInThread
            },
            where: {
                uri: uri
            }
        })
    }
}