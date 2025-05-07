import {CustomLink} from "../../../modules/ui-utils/src/custom-link";
import {topicUrl} from "@/utils/uri";
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs"

type TopicsMentionedProps = {mentions: TopicMention[]}

export const TopicsMentioned = ({mentions}: TopicsMentionedProps) => {

    function cmp(a: {count: number}, b: {count: number}) {
        return b.count - a.count
    }

    if(!mentions || mentions.length == 0) {
        return null
    }

    return <div className={"w-full flex space-x-4 max-w-screen overflow-scroll no-scrollbar"}>
        <div className={"text-sm text-[var(--text-light)]"} title={"Temas mencionados"}>
            #
        </div>
        {mentions.sort(cmp).slice(0, 4).map((r, index) => {
            return <CustomLink
                href={topicUrl(r.id)}
                key={index}
                className={"text-[var(--text-light)] hover:text-[var(--text)] text-sm whitespace-nowrap"}
                title={"Tema mencionado en el artículo."}
            >
                {r.title}
            </CustomLink>
        })}
    </div>
}