import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {PostPreview} from "./post/post-preview";
import {Dispatch, SetStateAction} from "react";
import {smoothScrollTo} from "../utils/react/scroll";
import {FeedEndText} from "./feed/feed-end-text";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {AppBskyFeedPost} from "@atproto/api";
import {getCollectionFromUri, isTopicVersion} from "@cabildo-abierto/utils";


type ThreadRepliesProps = {
    replies: ArCabildoabiertoFeedDefs.ThreadViewContent["replies"] | null
    setPinnedReplies?: Dispatch<SetStateAction<string[]>>
    parentRef?: ATProtoStrongRef
    onClickQuote?: (cid: string) => void
}


export default function ThreadReplies({
    parentRef,
    replies,
    setPinnedReplies,
    onClickQuote
}: ThreadRepliesProps) {

    if (!replies) return null

    return <>
        {replies.map(r => {
            if ((!ArCabildoabiertoFeedDefs.isThreadViewContent(r) && !ArCabildoabiertoFeedDefs.isFeedViewContent(r)) || !ArCabildoabiertoFeedDefs.isPostView(r.content)) {
                return null
            }

            const onClickQuoteHandler = () =>  {
                if(onClickQuote) {
                    if (ArCabildoabiertoFeedDefs.isThreadViewContent(r) && ArCabildoabiertoFeedDefs.isPostView(r.content)) {
                        onClickQuote(r.content.cid)
                    }
                } else {
                    if (ArCabildoabiertoFeedDefs.isThreadViewContent(r) && ArCabildoabiertoFeedDefs.isPostView(r.content)) {
                        setPinnedReplies([r.content.cid])
                        const elem = document.getElementById("selection:" + r.content.cid)
                        if (elem) {
                            smoothScrollTo(elem)
                        }
                    }
                }
            }

            const editedParent = parentRef && ArCabildoabiertoFeedDefs.isPostView(r.content) && parentRef.cid != (r.content.record as AppBskyFeedPost.Record)?.reply?.parent.cid

            return <div key={r.content.uri} className={"min-[600px]:w-full w-screen"}>
                <PostPreview
                    postView={r.content}
                    parentIsMainPost={true}
                    onClickQuote={onClickQuoteHandler}
                    threadViewContent={r}
                    editedParent={editedParent && !isTopicVersion(getCollectionFromUri(parentRef.uri))}
                    pageRootUri={parentRef?.uri}
                />
            </div>
        })}
        {replies.length == 0 && <FeedEndText text={"Todavía no hay respuestas."}/>}
    </>
}