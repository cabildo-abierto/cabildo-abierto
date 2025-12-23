import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption, FollowingFeedFilter} from "./session";
import {AppBskyFeedDefs} from "@atproto/api";

export type MainFeedConfig = {
    type: "main"
    subtype: "siguiendo"
    filter?: FollowingFeedFilter
    format?: FeedFormatOption
} | {
    type: "main"
    subtype: "discusion"
    metric?: EnDiscusionMetric
    format?: FeedFormatOption
    time?: EnDiscusionTime
} | {
    type: "main"
    subtype: "descubrir"
    // TO DO: metric, format, time, interests
}


export type TopicFeedConfig =  {
    type: "topic"
    subtype: "mentions"
    id: string
    metric?: EnDiscusionMetric
    format?: FeedFormatOption
    time?: EnDiscusionTime
    title: string
} | {
    type: "topic"
    subtype: "replies"
    id: string
    title: string
}


export type ProfileFeedConfig = {
    type: "profile"
    subtype: "main" | "replies" | "edits" | "articles"
    did: string
}


export type CustomFeedConfig = {
    type: "custom"
    subtype: "custom"
    uri: string
    displayName: string
}


export type FeedConfig = MainFeedConfig | TopicFeedConfig | ProfileFeedConfig | CustomFeedConfig


export type FeedView = {
    type: "custom"
    feed: AppBskyFeedDefs.GeneratorView
} | MainFeedConfig | TopicFeedConfig | ProfileFeedConfig