import {TopicsMentioned} from "@/components/article/topics-mentioned";
import {Authorship} from "@/components/feed/content-top-row-author";
import {localeDate} from "../../../modules/ui-utils/src/date";
import {ReadingTime} from "@/components/article/reading-time";
import {getNumWords} from "../../../modules/ca-lexical-editor/src/get-num-words";
import {FullArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"


export const ArticleHeader = ({article}: {article: FullArticleView}) => {
    return <>
        <TopicsMentioned references={[]}/> {/* TO DO */}
        <h1 className="text-4xl mt-8 mb-8">
            {(article.record as ArticleRecord).title}
        </h1>
        <div className="gap-x-4 flex flex-wrap items-baseline">
            <span className={"max-[500px]:text-base text-lg"}>
                Artículo de <Authorship content={article} onlyAuthor={true}/>
            </span>
            <span className={"max-[500px]:text-sm text-[var(--text-light)]"}>
                {localeDate(new Date(article.indexedAt), false, false)}
            </span>
            <span className={"text-[var(--text-light)]"}>
                <ReadingTime
                    numWords={getNumWords(article.text, "markdown")} // TO DO: article.format
                />
            </span>
        </div>
    </>
}