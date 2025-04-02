"use client"
import {ArticleProps, FastPostProps} from '@/lib/definitions'
import ReadOnlyEditor from '../editor/read-only-editor'
import {Authorship} from "../feed/content-top-row-author";
import {localeDate} from "../../../modules/ui-utils/src/date";
import {decompress} from "../../utils/compression";
import {EngagementIcons} from "@/components/feed/reactions/engagement-icons";
import {useEffect} from "react";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {useSWRConfig} from "swr";
import {TopicsMentioned} from "./topics-mentioned";
import {ReadingTime} from "./reading-time";
import {getAllText} from "@/components/topics/topic/diff";
import {threadApiUrl} from "../../utils/uri";
import {ArticleHeader} from "@/components/article/article-header";

type ArticleCompProps = {
    article: ArticleProps,
    quoteReplies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
}

export const Article = ({article, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {

    const {mutate} = useSWRConfig()

    useEffect(() => {
        const hash = window.location.hash
        if (hash) {
            const id = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById(id);
                if (element) {
                    smoothScrollTo(element)
                    setPinnedReplies([...pinnedReplies, id])
                } else {
                    setTimeout(scrollToElement, 100)
                }
            };
            scrollToElement()
        }
    }, [])

    const editorId = article.uri+"-"+quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-")

    return <div className="w-full">
        <div className={"p-3 border-b"}>
            <ArticleHeader article={article}/>
            <div className={"mt-8"} id={editorId}>
                <ReadOnlyEditor
                    initialData={decompress(article.content.text)}
                    allowTextComments={true}
                    editorClassName={"article-content"}
                    content={article}
                    quoteReplies={quoteReplies}
                    pinnedReplies={pinnedReplies}
                    setPinnedReplies={setPinnedReplies}
                    showTableOfContents={true}
                />
            </div>
        </div>
        <div className={"py-2 px-3 border-b"}>
            <EngagementIcons
                counters={article}
                record={article}
                className={"flex justify-between px-4 w-full"}
                onDelete={async () => {
                    mutate(threadApiUrl(article.uri))
                }}
            />
        </div>
    </div>
}