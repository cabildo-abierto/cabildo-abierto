import {TopicsMentioned} from "@/components/article/topics-mentioned";
import {localeDate} from "../../../modules/ui-utils/src/date";
import {ReadingTime} from "@/components/article/reading-time";
import {getNumWords} from "../../../modules/ca-lexical-editor/src/get-num-words";
import {FullArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Authorship} from "@/components/feed/frame/authorship";


export const ArticleHeader = ({article}: {article: FullArticleView}) => {
    return <>
        <TopicsMentioned mentions={article.topicsMentioned}/>
        <h1 className="text-4xl mt-8 mb-8">
            {article.title}
        </h1>
        <div className="gap-x-4 flex flex-wrap items-baseline">
            <div className={"max-[500px]:text-base text-lg flex space-x-1"}>
                <div>
                    Artículo de
                </div>
                <Authorship author={article.author} onlyAuthor={true}/>
            </div>
            <div className={"max-[500px]:text-sm text-[var(--text-light)]"}>
                {localeDate(new Date(article.indexedAt), false, false)}
            </div>
            <div className={"text-[var(--text-light)]"}>
                <ReadingTime
                    numWords={getNumWords(article.text, "markdown")} // TO DO: article.format
                />
            </div>
        </div>
    </>
}