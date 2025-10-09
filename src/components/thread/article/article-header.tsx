import {TopicsMentioned} from "@/components/thread/article/topics-mentioned";
import {localeDate} from "../../../../modules/ui-utils/src/date";
import {ReadingTime} from "@/components/thread/article/reading-time";
import {getNumWords} from "../../../../modules/ca-lexical-editor/src/get-num-words";
import {Authorship} from "@/components/feed/frame/authorship";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {ProfilePic} from "@/components/profile/profile-pic";


export const ArticleHeader = ({article}: {article: ArCabildoabiertoFeedDefs.FullArticleView}) => {
    return <>
        <TopicsMentioned mentions={article.topicsMentioned}/>
        <h1 className="text-4xl mt-8 mb-8 normal-case">
            {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4">
            <div className={"flex items-center gap-x-1"}>
            <ProfilePic user={article.author} className={"rounded-full h-[14px] w-[14px]"}/>
            <Authorship
                author={article.author}
                onlyAuthor={true}
                className={"font-medium hover:underline truncate max-w-[70vw]"}
                iconFontSize={16}
            />
            </div>
            <div className={"max-[500px]:text-sm text-[var(--text-light)] font-light"}>
                {localeDate(new Date(article.indexedAt), false, false)}
            </div>
            <div className={"text-[var(--text-light)]"}>
                <ReadingTime
                    numWords={getNumWords(article.text, "markdown")} // TO DO: article.format
                />
            </div>
        </div>
        {article.editedAt != null && <div className={"text-xs flex justify-end font-light text-[var(--text-light)]"}>
            Editado {localeDate(new Date(article.editedAt), false, false, false, true)}.
        </div>}
    </>
}