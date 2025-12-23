import {cn} from "@/lib/utils";
import {BaseButton} from "@/components/utils/base/base-button";
import {getFeedLabel} from "@/components/feed/feed/main-feed-header";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {useState} from "react";
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon";
import {FeedTabOptionsButton} from "@/components/feed/feed/feed-tab-options-button";
import {FeedConfigPanel} from "@/components/feed/config/feed-config-panel";


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


export const MainFeedHeaderButton = ({index: i}: {
    index: number
}) => {
    const {openFeeds, select, closeTab, configOpen, setConfigOpen} = useMainPageFeeds()
    const [hovered, setHovered] = useState(false)
    const [dragging, setDragging] = useState(false)

    const feed = openFeeds.tabs[i]

    const isSelected = openFeeds.selected === i

    function onClickOptionsButton() {
        if (isSelected) {
            setConfigOpen(!configOpen)
        } else if (!configOpen) {
            setConfigOpen(true)
        }
        select(i, false)
    }

    return <>
        <BaseButton
            onClick={() => {
                select(i, true)
            }}
            variant="default"
            className="py-0 px-2 space-x-0"
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
                    "flex text-[13px] items-center whitespace-nowrap pt-2 pb-1 font-medium border-b-[4px]",
                    isSelected
                        ? "border-[var(--text-light)] text-[var(--text)]"
                        : "border-transparent text-[var(--text-light)]"
                )}
            >
            {getFeedLabel(feed.config)}
        </span>
            <div
                className={cn("mb-[2px] hover:rounded-full hover:bg-[var(--background-dark2)] p-[2px] cursor-pointer opacity-0", hovered && !dragging && "opacity-100")}
                onClick={(e) => {
                    e.stopPropagation();
                    closeTab(i)
                }}
            >
                <CloseButtonIcon size={10}/>
            </div>
        </BaseButton>
        {configOpen && <FeedConfigPanel
            configOpen={configOpen}
            onClose={() => {
                setConfigOpen(false)
            }}
        />}
    </>
}