import {ArticleProps} from "../../app/lib/definitions";
import {topicUrl} from "../utils/utils";
import {CustomLink} from "../ui-utils/custom-link";


export const TopicsMentioned = ({article}: {article: ArticleProps}) => {

    function cmp(a: {count: number}, b: {count: number}) {
        return b.count - a.count
    }

    return <div className={"w-full flex space-x-4"}>
        {article.content.references.sort(cmp).slice(0, 4).map((r, index) => {
            return <CustomLink
                href={topicUrl(r.referencedTopicId)}
                key={index}
                className={"text-[var(--text-light)] hover:text-[var(--text)] text-sm"}
                title={"Tema mencionado en el artículo."}
            >
                {r.referencedTopicId}
            </CustomLink>
        })}
    </div>
}