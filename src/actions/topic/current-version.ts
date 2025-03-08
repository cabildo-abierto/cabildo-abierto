"use server"
import {db} from "../../db";


/*export async function updateTopicsCurrentVersions(){
    const topics = await db.topic.findMany({
        select: {
            id: true,
            currentVersionId: true,
            versions: {
                select: {
                    uri: true,
                    content: {
                        select: {
                            record: {
                                select: {
                                    createdAt: true,
                                    reactions: {
                                        select: {
                                            uri: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            },
        }
    })
    const currentVersions: {id: string, currentVersion: string}[] = []
    for(let i = 0; i < topics.length; i++) {
        currentVersion = getCur
    }
}*/