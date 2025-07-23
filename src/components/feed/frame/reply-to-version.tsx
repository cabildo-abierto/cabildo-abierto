import {DateSince} from "../../../../modules/ui-utils/src/date";
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import Link from "next/link";
import {splitUri, topicUrl} from "@/utils/uri";


export const ReplyToVersion = ({postView, pageRootUri}: {postView: PostView, pageRootUri?: string}) => {
    if(pageRootUri && postView.rootCreationDate){
        const record = postView.record as PostRecord
        if(record.reply && record.reply.root){
            const rootUri = record.reply.root.uri
            if(rootUri != pageRootUri){
                const {did, rkey} = splitUri(rootUri)
                const url = topicUrl(undefined, {did, rkey}, "normal")
                return <div className={"text-sm text-[var(--text-light)] px-4 py-2"}>
                    Respuesta a una versión del tema publicada hace <DateSince date={postView.rootCreationDate}/>. <Link
                        href={url}
                        className={"hover:underline font-semibold"}
                        onClick={(e) => {e.stopPropagation()}}
                    >
                        Ver versión
                    </Link>.
                </div>
            }
        }
    }

}