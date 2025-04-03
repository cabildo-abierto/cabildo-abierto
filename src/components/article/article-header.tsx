import {TopicsMentioned} from "@/components/article/topics-mentioned";
import {Authorship} from "@/components/feed/content-top-row-author";
import {localeDate} from "../../../modules/ui-utils/src/date";
import {ReadingTime} from "@/components/article/reading-time";
import {getAllText} from "@/components/topics/topic/diff";
import {decompress} from "@/utils/compression";
import {ArticleProps} from "@/lib/definitions";
import {getNumWords} from "../../../modules/ca-lexical-editor/src/get-num-words";


export const ArticleHeader = ({article}: {article: ArticleProps}) => {
    return <>
        <TopicsMentioned article={article}/>
        <h1 className="text-4xl mt-8 mb-8">
            {article.content.article.title}
        </h1>
        <div className="gap-x-4 flex flex-wrap items-baseline">
            <span className={"max-[500px]:text-base text-lg"}>
                Artículo de <Authorship content={article} onlyAuthor={true}/>
            </span>
            <span className={"max-[500px]:text-sm text-[var(--text-light)]"}>
                {localeDate(new Date(article.createdAt), true)}
            </span>
            <span className={"text-[var(--text-light)]"}>
                <ReadingTime
                    numWords={getNumWords(article.content.text, article.content.format)}
                />
            </span>
        </div>
    </>
}