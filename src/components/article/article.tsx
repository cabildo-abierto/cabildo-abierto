"use client"
import {ArticleProps, FastPostProps} from '../../app/lib/definitions'
import ReadOnlyEditor from '../editor/read-only-editor'
import {Authorship} from "../feed/content-top-row-author";
import {localeDate} from "../ui-utils/date";
import {decompress} from "../utils/compression";
import {EngagementIcons} from "../reactions/engagement-icons";
import {useEffect} from "react";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {useSWRConfig} from "swr";
import {TopicsMentioned} from "./topics-mentioned";
import {ReadingTime} from "./reading-time";
import {getAllText} from "../topic/diff";
import {threadApiUrl} from "../utils/uri";

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
            <TopicsMentioned article={article}/>
            <h1 className="text-4xl mt-16 mb-8">
                {article.content.article.title}
            </h1>
            <div className={"flex justify-between"}>
                <div className="space-x-4 flex items-baseline">
                    <div className={"text-lg"}>
                        Artículo de <Authorship content={article} onlyAuthor={true}/>
                    </div>
                    <div className={"text-[var(--text-light)]"}>
                        {localeDate(new Date(article.createdAt), true)}
                    </div>
                </div>
                <div className={"text-[var(--text-light)]"}>
                    <ReadingTime numWords={getAllText(JSON.parse(decompress(article.content.text)).root).split(" ").length}/>
                </div>
            </div>
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