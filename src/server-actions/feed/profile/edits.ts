"use server"
import {FeedContentProps} from "@/lib/definitions";
import {db} from "@/db";
import {recordQuery} from "@/server-actions/utils";

export async function getEditsProfileFeed(userId: string): Promise<{feed?: FeedContentProps[], error?: string}>{
    const edits: FeedContentProps[] = await db.record.findMany({
        select: {
            ...recordQuery,
            content: {
                select: {
                    topicVersion: {
                        select: {
                            topic: {
                                select: {
                                    id: true,
                                    versions: {
                                        select: {
                                            title: true,
                                            categories: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            authorId: userId,
            collection: "ar.com.cabildoabierto.topic"
        }
    })
    return {feed: edits}
}