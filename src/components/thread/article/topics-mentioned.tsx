import {topicUrl} from "@/utils/uri";
import { ModalOnHover } from "../../../../modules/ui-utils/src/modal-on-hover";
import TagIcon from '@mui/icons-material/Tag';
import Link from "next/link";
import { IconButton } from "../../../../modules/ui-utils/src/icon-button";
import {useMemo} from "react";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import TopicsIcon from "@/components/icons/topics-icon";

type TopicsMentionedProps = {mentions: ArCabildoabiertoFeedDefs.TopicMention[]}


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


export const TopicsMentioned = ({
                                    mentions
}: TopicsMentionedProps) => {

    function cmp(a: {count: number}, b: {count: number}) {
        return b.count - a.count
    }

    const mentionsMemo = useMemo(() => {
        return mentions
    }, [JSON.stringify(mentions)])

    if(!mentionsMemo || mentionsMemo.length == 0) {
        return null
    }

    const maxCount = 4

    const hoverDescription = mentionsMemo.length > maxCount ? <div className={"flex flex-col space-y-1"}>
        {mentionsMemo
        .slice(maxCount)
            .map(x => {
                return <div key={x.id}>
                    <Link
                        className="text-[var(--text-light)] font-light hover:text-[var(--text)] text-sm whitespace-nowrap cursor-pointer"
                        href={topicUrl(x.id)}
                    >
                        {x.title}
                    </Link>
                </div>
            })}
    </div> : null

    return <div className={"w-full flex text-light space-x-4 max-w-screen overflow-scroll no-scrollbar"}>
        <div className={"text-sm text-[var(--text-light)] pt-[1px]"} title={"Temas mencionados"}>
            <TopicsIcon fontSize={15} weight={"light"}/>
        </div>
        {mentionsMemo.toSorted(cmp).slice(0, maxCount).map((r, index) => {
            return <a // TO DO: Prevent leave
                href={topicUrl(r.id)}
                key={index}
                className={"text-[var(--text-light)] font-light hover:text-[var(--text)] text-sm whitespace-nowrap"}
                title={"Tema mencionado en el artículo."}
            >
                {r.title}
            </a>
        })}
        {mentionsMemo.length > maxCount && <DescriptionOnHover description={hoverDescription}>
            <div
            className={"text-[var(--text-light)] hover:text-[var(--text)] text-sm whitespace-nowrap cursor-pointer"}
        >
            {mentionsMemo.length - maxCount}+
            </div>
        </DescriptionOnHover>}
    </div>
}