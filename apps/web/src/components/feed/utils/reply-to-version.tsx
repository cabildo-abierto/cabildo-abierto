import Link from "next/link";
import {splitUri} from "@cabildo-abierto/utils";
import {AppBskyFeedPost} from "@atproto/api";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {formatIsoDate, formatIsoDateShort} from "@cabildo-abierto/utils";
import {topicUrl} from "@/components/utils/react/url";


export const ReplyToVersion = ({postView, pageRootUri}: {
    postView: ArCabildoabiertoFeedDefs.PostView,
    pageRootUri: string
}) => {
    const {did, rkey} = splitUri(pageRootUri)
    const {topic} = useTopicWithNormalizedContent(undefined, did, rkey)
    if (pageRootUri && postView.rootCreationDate && topic && topic != "loading") {
        const record = postView.record as AppBskyFeedPost.Record
        if (record.reply && record.reply.root) {
            const rootUri = record.reply.root.uri
            if (rootUri != pageRootUri) {
                const {did, rkey} = splitUri(rootUri)
                const url = topicUrl(undefined, {did, rkey})

                const text = new Date(postView.rootCreationDate) < new Date(topic.createdAt) ? `Respuesta a una versión del tema anterior (${formatIsoDate(postView.rootCreationDate, true)}).` :
                    `Respuesta a una versión más reciente del tema (${formatIsoDateShort(postView.rootCreationDate, true)}).`

                return <div className={"text-sm text-[var(--text-light)] px-4 py-2"}>
                    {text} <Link
                    href={url}
                    className={"hover:underline font-semibold"}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    Ver versión
                </Link>.
                </div>
            }
        }
    }

}