import {FeedConfig, FeedView} from "@cabildo-abierto/api";
import {useFeedDescription} from "@/components/feed/utils/use-feed-description";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import Image from "next/image";
import {MountainsIcon, PlusIcon, RssIcon, UsersIcon} from "@phosphor-icons/react";
import TopicsIcon from "@/components/utils/icons/topics-icon";
import EnDiscusionIcon from "@/components/utils/icons/en-discusion-icon";
import Link from "next/link";
import {getFeedLabel} from "@/components/feed/feed/main-feed-header";
import {profileUrl} from "@cabildo-abierto/utils";
import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {Note} from "@/components/utils/base/note";
import {topicUrl} from "@/components/utils/react/url";
import {useSession} from "@/components/auth/use-session";
import {useLoginModal} from "@/components/auth/login-modal-provider";

function getFeedName(feed: FeedView) {
    if (feed.type == "custom") {
        return feed.feed.displayName
    } else {
        return getFeedLabel(feed)
    }
}


function feedViewToConfig(feed: FeedView): FeedConfig {
    if (feed.type == "custom") {
        return {
            type: "custom",
            subtype: "custom",
            uri: feed.feed.uri,
            displayName: feed.feed.displayName
        }
    } else {
        return feed
    }
}


export const FeedPreview = ({feed}: {
    feed: FeedView
}) => {
    const name = getFeedName(feed)
    const {description, descriptionFacets} = useFeedDescription(feed)
    const {addFeed} = useMainPageFeeds()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()

    return <div className={"border-b p-4 flex justify-between items-center space-x-2"}>
        <div className={"flex-1"}>
            <div className={"flex space-x-4 items-center pb-2"}>
                {feed.type == "custom" && feed.feed.avatar && <div>
                    <Image
                        src={feed.feed.avatar}
                        alt={"Avatar de " + feed.feed.displayName}
                        className={"h-12 w-12 rounded-[8px]"}
                        width={400}
                        height={400}
                    />
                </div>}
                {feed.type == "custom" && !feed.feed.avatar && <div
                    className={"bg-[var(--background-dark2)] h-12 w-12 rounded-[8px] flex justify-center items-center"}>
                    <RssIcon size={24}/>
                </div>}
                {feed.type == "topic" && <div
                    className={"bg-[var(--background-dark2)] h-12 w-12 rounded-[8px] flex justify-center items-center"}>
                    <TopicsIcon fontSize={24}/>
                </div>}
                {feed.type == "main" && feed.subtype == "siguiendo" && <div
                    className={"bg-[var(--background-dark2)] h-12 w-12 rounded-[8px] flex justify-center items-center"}>
                    <UsersIcon fontSize={24}/>
                </div>}
                {feed.type == "main" && feed.subtype == "discusion" && <div
                    className={"bg-[var(--background-dark2)] h-12 w-12 rounded-[8px] flex justify-center items-center"}>
                    <EnDiscusionIcon fontSize={24}/>
                </div>}
                {feed.type == "main" && feed.subtype == "descubrir" && <div
                    className={"bg-[var(--background-dark2)] h-12 w-12 rounded-[8px] flex justify-center items-center"}>
                    <MountainsIcon fontSize={24}/>
                </div>}

                <div>
                    {feed.type != "topic" && <h2 className={"text-base font-semibold"}>
                        {name}
                    </h2>}
                    {feed.type == "topic" && <Link href={topicUrl(feed.id)}>
                        <h2 className={"text-base font-semibold"}>
                            {name}
                        </h2>
                    </Link>}
                    {feed.type == "custom" && <div className={"text-[var(--text-light)] font-light text-sm"}>
                <span>
                    Creado por
                </span> <Link className={"hover:underline"} href={profileUrl(feed.feed.creator.handle)}>
                        {feed.feed.creator.displayName}
                    </Link> {!feed.feed.creator.displayName.startsWith("@") &&
                        <Link className={""} href={profileUrl(feed.feed.creator.handle)}>
                            @{feed.feed.creator.handle}
                        </Link>}
                    </div>}
                </div>
            </div>
            {description && <BskyRichTextContent
                className={"text-[15px] max-w-[480px] break-words"}
                post={{text: description, facets: descriptionFacets}}
            />}
            {feed.type == "topic" && <Note className={"text-left"}>
                Sinónimos: {feed.synonyms.join(", ")}.
            </Note>}
        </div>
        <div className={"flex items-center space-x-2"}>
            <BaseIconButton
                variant={"outlined"}
                size={"small"}
                onClick={() => {
                    if(user) {
                        addFeed(feedViewToConfig(feed))
                    } else {
                        setLoginModalOpen(true, true, "Iniciá sesión o creá una cuenta para empezar a configurar tu pantalla principal.")
                    }
                }}
            >
                <PlusIcon/>
            </BaseIconButton>
        </div>
    </div>
}