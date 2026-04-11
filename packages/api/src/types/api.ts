import {$Typed} from "@atproto/api";
import { ArCabildoabiertoFeedDefs } from "../client";
import {
    ConvoView
} from "@atproto/api/dist/client/types/chat/bsky/convo/defs.js";

export type TopicDiscussionOutput = $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>[]


export type GetConversationsOutput = {
    authorized: true
    conversations: ConvoView[]
} | {
    authorized: false
}