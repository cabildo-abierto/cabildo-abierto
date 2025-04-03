"use server"
import {FeedContentProps} from "@/lib/definitions";


export async function getDiscoverFeed(): Promise<{feed?: FeedContentProps[], error?: string}> {
    //

    return {feed: []}
}