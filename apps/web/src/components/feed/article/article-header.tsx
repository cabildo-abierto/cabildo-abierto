import {TopicsMentioned} from "./topics-mentioned";
import {localeDate} from "@/components/utils/base/date";
import {ReadingTime} from "./reading-time";
import {Authorship} from "../../perfil/authorship";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {ProfilePic} from "../../perfil/profile-pic";
import { getNumWords } from "@cabildo-abierto/editor-core";


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
        {article.editedAt != null && <div className={"pr-4 text-xs flex justify-end font-light text-[var(--text-light)]"}>
            Editado {localeDate(new Date(article.editedAt), false, false, false, true)}.
        </div>}
    </>
}