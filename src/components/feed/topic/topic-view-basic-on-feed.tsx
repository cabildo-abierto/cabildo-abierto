import {getTopicTitle} from "@/components/topics/topic/utils"
import {topicUrl} from "@/utils/uri"
import Link from "next/link"
import {usePathname} from "next/navigation";
import {CustomLink} from "../../layout/utils/custom-link";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import ReplyIcon from "@/components/layout/icons/reply-icon";

export const TopicViewBasicOnFeed = ({topic, showingChildren}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicViewBasic
    showingChildren: boolean
}) => {
    const pathname = usePathname()

    if (pathname.startsWith("/tema")) {
        return null
    }

    if (showingChildren) {
        return <CustomLink
            tag={"div"}
            href={topicUrl(topic.id)}
            className={"w-full hover:bg-[var(--background-dark)] text-sm text-[var(--text-light)] px-4 py-2 flex space-x-2 items-center"}
        >
            <ReplyIcon/>
            <div>
                <span>
                Respuesta al tema
                </span> <span className={"font-medium"}>
                    {getTopicTitle(topic)}
                </span>
            </div>
        </CustomLink>
    } else {
        const inSearch = pathname.startsWith("/buscar")

        return <Link href={topicUrl(topic.id)}>
            <div className={"hover:bg-[var(--background-dark)] w-full text-[var(--text-light)] p-4 border-b"}>
                <span>{inSearch ? "Tema" : "Edición del tema"}</span> <span
                className={"text-[var(--primary)]"}>{getTopicTitle(topic)}</span>
            </div>
        </Link>
    }

}