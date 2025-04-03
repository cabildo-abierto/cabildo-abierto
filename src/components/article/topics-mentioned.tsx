import {ArticleProps} from "@/lib/definitions";
import {CustomLink} from "../../../modules/ui-utils/src/custom-link";
import {topicUrl} from "@/utils/uri";


export const TopicsMentioned = ({article}: {article: ArticleProps}) => {

    function cmp(a: {count: number}, b: {count: number}) {
        return b.count - a.count
    }

    if(!article.content.references || article.content.references.length == 0) {
        return null
    }

    return <div className={"w-full flex space-x-4 max-w-screen overflow-scroll no-scrollbar"}>
        {article.content.references.sort(cmp).slice(0, 4).map((r, index) => {
            return <CustomLink
                href={topicUrl(r.referencedTopicId)}
                key={index}
                className={"text-[var(--text-light)] hover:text-[var(--text)] text-sm whitespace-nowrap"}
                title={"Tema mencionado en el artículo."}
            >
                {r.referencedTopicId}
            </CustomLink>
        })}
    </div>
}