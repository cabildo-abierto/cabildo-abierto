import {topicUrl} from "@/utils/uri";
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import { ModalOnHover } from "../../../modules/ui-utils/src/modal-on-hover";
import TagIcon from '@mui/icons-material/Tag';
import Link from "next/link";
import { IconButton } from "../../../modules/ui-utils/src/icon-button";

type TopicsMentionedProps = {mentions: TopicMention[]}


export const TopicsMentionedSmall = ({mentions}: TopicsMentionedProps) => {
    if(!mentions || mentions.length == 0) return null

    const modal = <div className={"bg-[var(--background-dark)] py-2 px-4 space-y-1 rounded border"}>
        <div className={"font-semibold text-sm"}>Temas</div>
        {mentions.map((r, index) => {
            return <div key={index}>
                <Link href={topicUrl(r.id)} className={"hover:text-[var(--text)] text-sm text-[var(--text-light)]"}>
                    {r.title}
                </Link>
            </div>
        })}
    </div>

    return <ModalOnHover modal={modal}>
        <IconButton size={"small"} color={"background-dark"} textColor={"text-light"}>
            <TagIcon/>
        </IconButton>
    </ModalOnHover>
}


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
            return <a // TO DO: Prevent leave
                href={topicUrl(r.id)}
                key={index}
                className={"text-[var(--text-light)] hover:text-[var(--text)] text-sm whitespace-nowrap"}
                title={"Tema mencionado en el artículo."}
            >
                {r.title}
            </a>
        })}
    </div>
}