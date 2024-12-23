"use client"
import {ArticleProps, FastPostProps} from '../../app/lib/definitions'
import ReadOnlyEditor from '../editor/read-only-editor'
import {Authorship} from "../content-top-row-author";
import {ReadingTime} from "../reading-time";
import {DateSince} from "../date";
import {decompress} from "../compression";
import {EngagementIcons} from "./engagement-icons";

type ArticleCompProps = {
    content: ArticleProps,
    quoteReplies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
}

export const Article = ({content, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {

    return <div className="w-full">
        <div className={"p-3 border-b"}>
            <div className={"text-lg mb-2"}>
                Artículo
            </div>
            <h1 className="font-bold title">
                {content.content.article.title}
            </h1>
            <div className="sm:space-x-1 text-sm sm:text-base flex flex-col sm:flex-row sm:items-center">
                <span><Authorship content={content} onlyAuthor={true}/>, <DateSince date={content.createdAt}/>.</span>
                {/*<span className="first-letter:capitalize"><TextViewsCounter content={content}/>.</span>*/}
                <ReadingTime numWords={content.content.numWords}/>
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
            <EngagementIcons counters={content} record={content} options={null}/>
        </div>
        <div>
        </div>
    </div>
}