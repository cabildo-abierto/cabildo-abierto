import {getTopicTitle} from "../../tema/utils"
import {usePathname} from "next/navigation"
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import ReplyIcon from "@/components/utils/icons/reply-icon";
import {CustomLink} from "@/components/utils/base/custom-link";
import {topicUrl} from "@/components/utils/react/url";
import {DateSince} from "@/components/utils/base/date";
import ValidationIcon from "@/components/perfil/validation-icon";
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import dynamic from "next/dynamic";
import {splitUri} from "@cabildo-abierto/utils";


const UserSummaryOnHover = dynamic(() => import("../../perfil/user-summary"), {
    ssr: false,
    loading: () => <></>
});


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

        const author = topic.versionAuthor
        const verification = author.verification

        return <CustomLink tag={"div"} href={topicUrl(topic.id, splitUri(topic.versionRef.uri))}>
            <div className={"hover:bg-[var(--background-dark)] w-full text-[var(--text-light)] p-4 border-b"}>
                <span>{inSearch ? "Tema" : "Edición del tema"}</span> <span
                className={"font-semibold"}>{getTopicTitle(topic)}</span>
                <div className={"text-sm flex space-x-1"}>
                    <UserSummaryOnHover handle={author.handle}>
                        <div className={"flex justify-between items-center space-x-1"}>
                            <div className={"flex space-x-1 items-center"}>
                                <div className={"hover:underline font-bold"}>
                                    {author.displayName ? author.displayName : author.handle}
                                </div>
                                <ValidationIcon fontSize={15} handle={author.handle} verification={verification}/>
                                <div className={"text-[var(--text-light)]"}>
                                    @{author.handle}
                                </div>
                            </div>
                            {!author.caProfile && <div className={"pb-[2px]"}><BlueskyLogo className={"w-auto h-[10px]"}/></div>}
                        </div>
                    </UserSummaryOnHover>
                    <div>
                        ·
                    </div>
                    <div>
                        hace <DateSince date={topic.versionCreatedAt}/>
                    </div>
                </div>
            </div>
        </CustomLink>
    }

}