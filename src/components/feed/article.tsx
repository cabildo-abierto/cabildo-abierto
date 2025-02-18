"use client"
import {ArticleProps, FastPostProps} from '../../app/lib/definitions'
import ReadOnlyEditor from '../editor/read-only-editor'
import {Authorship} from "../content-top-row-author";
import {ReadingTime} from "../reading-time";
import {DateSince} from "../date";
import {decompress} from "../compression";
import {EngagementIcons} from "./engagement-icons";
import {ProfilePic} from "./profile-pic";
import {useEffect} from "react";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";

type ArticleCompProps = {
    content: ArticleProps,
    quoteReplies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
}

export const Article = ({content, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {

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
                    setTimeout(scrollToElement, 100);
                }
            };
            scrollToElement();
        }
    }, []);

    return <div className="w-full">
        <div className={"p-3 border-b"}>
            <div className={"text-base text-[var(--text-light)]"}>
                Artículo
            </div>
            <h1 className="font-bold">
                {content.content.article.title}
            </h1>
            <div className="sm:space-x-1 text-sm sm:text-base flex flex-col sm:flex-row sm:items-center">
                <div>
                    <ProfilePic user={content.author} className={"w-5 h-5 rounded-full"}/>
                </div>
                <div>
                <span><Authorship content={content} onlyAuthor={true}/>, <DateSince date={content.createdAt}/>.</span>
                </div>
                {/*<span className="first-letter:capitalize"><TextViewsCounter content={content}/>.</span>*/}
                <div>
                    <ReadingTime numWords={content.content.numWords}/>
                </div>
            </div>
            <div className={"mt-4"}>
                <ReadOnlyEditor
                    initialData={decompress(content.content.text)}
                    allowTextComments={true}
                    content={content}
                    quoteReplies={quoteReplies}
                    pinnedReplies={pinnedReplies}
                    setPinnedReplies={setPinnedReplies}
                />
            </div>
        </div>
        <div className={"py-2 px-3 border-b"}>
            <EngagementIcons counters={content} record={content}/>
        </div>
        <div>
        </div>
    </div>
}