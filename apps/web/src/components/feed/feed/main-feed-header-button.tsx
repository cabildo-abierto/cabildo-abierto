import {cn} from "@/lib/utils";
import {BaseButton} from "@/components/utils/base/base-button";
import {getFeedLabel} from "@/components/feed/feed/main-feed-header";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {useState} from "react";
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon";
import {FeedTabOptionsButton} from "@/components/feed/feed/feed-tab-options-button";
import {FeedConfigPanel} from "@/components/feed/config/feed-config-panel";
import {MainPageFeedsState} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";


function getFeedIndex(id: string, openFeeds: MainPageFeedsState) {
    const label = getFeedLabel(openFeeds.tabs.find(x => x.id == id).config)
    const sameLabel = openFeeds.tabs
        .filter(x => getFeedLabel(x.config) == label)
        .toSorted((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return sameLabel.findIndex(x => x.id == id)
}


export const MainFeedHeaderButtonPlaceholder = ({text}: { text: string }) => {
    return <BaseButton
        variant="default"
        className="py-0 relative"
    >
        <span
            style={{height: 47}}
            className={cn(
                "flex text-[13px] items-center whitespace-nowrap pt-2 mx-[10px] pb-1 font-medium border-b-[4px] border-transparent text-[var(--text-light)]"
            )}
        >
            {text}
        </span>
    </BaseButton>
}


export const MainFeedHeaderButton = ({id, startDrag}: {
    id: string
    startDrag?: (e: any, id: string) => void
}) => {
    const {user} = useSession()
    const {openFeeds, select, closeTab, configOpen, setConfigOpen} = useMainPageFeeds()
    const [hovered, setHovered] = useState(false)
    const [dragging, setDragging] = useState(false)

    const feed = openFeeds.tabs.find(x => x.id == id)

    if(!feed) return null

    const isSelected = openFeeds.tabs[openFeeds.selected].id == id
    const i = openFeeds.tabs.findIndex(x => x.id == id)

    function onClickOptionsButton() {
        if (isSelected) {
            setConfigOpen(!configOpen)
        } else if (!configOpen) {
            setConfigOpen(true)
        }
        select(i, false)
    }

    const idx = getFeedIndex(feed.id, openFeeds)

    return <>
        <BaseButton
            onClick={() => {
                select(i, true)
            }}
            variant="default"
            className="py-0 px-2 space-x-0 tab"
            onMouseEnter={() => {
                setHovered(true)
            }}
            onMouseLeave={() => {
                setHovered(false)
            }}
            onDragStart={() => {
                setDragging(true)
            }}
            onDragEnd={() => {
                setDragging(false)
            }}
            onPointerDown={(e) => {
                e.preventDefault()
                if(startDrag) startDrag(e, id)
            }}
            draggable={false}
        >
            <FeedTabOptionsButton
                configOpen={configOpen}
                hovered={hovered}
                dragging={dragging}
                onClick={onClickOptionsButton}
                isSelected={isSelected}
            />
            <span
                style={{height: 47}}
                className={cn(
                    "flex space-x-1 text-[13px] items-center whitespace-nowrap pt-2 pb-1 font-medium border-b-[4px]",
                    isSelected
                        ? "border-[var(--text-light)] text-[var(--text)]"
                        : "border-transparent text-[var(--text-light)]"
                )}
            >
                <span className={"max-w-32 truncate"}>{getFeedLabel(feed.config)}</span> <span className={idx == 0 ? "hidden" : ""}
                >
                    ({idx+1})
                </span>
            </span>
            <div
                className={cn("mb-[2px] hover:rounded-full hover:bg-[var(--background-dark2)] p-[2px] cursor-pointer opacity-0", user && hovered && !dragging && "opacity-100")}
                onClick={(e) => {
                    if(user) {
                        e.stopPropagation()
                        closeTab(i)
                    }
                }}
            >
                <CloseButtonIcon size={10}/>
            </div>
        </BaseButton>
        <FeedConfigPanel
            configOpen={configOpen}
            onClose={() => {
                setConfigOpen(false)
            }}
        />
    </>
}