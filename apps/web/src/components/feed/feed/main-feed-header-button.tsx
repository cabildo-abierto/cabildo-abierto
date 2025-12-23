import {cn} from "@/lib/utils";
import {BaseButton} from "@/components/utils/base/base-button";
import {getFeedLabel} from "@/components/feed/feed/main-feed-header";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {useState} from "react";
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon";


export const MainFeedHeaderButton = ({index: i}: {
    index: number
}) => {
    const {openFeeds, select, closeTab} = useMainPageFeeds()
    const [hovered, setHovered] = useState(false)
    const [dragging, setDragging] = useState(false)

    const feed = openFeeds.tabs[i]

    const isSelected = openFeeds.selected === i
    return <BaseButton
        onClick={() => {select(i)}}
        variant="default"
        className="py-0 relative"
        onMouseEnter={() => {setHovered(true)}}
        onMouseLeave={() => {setHovered(false)}}
        onDragStart={() => {setDragging(true)}}
        onDragEnd={() => {setDragging(false)}}
    >
        <span
            style={{height: 47}}
            className={cn(
                "flex text-[13px] items-center whitespace-nowrap pt-2 mx-[10px] pb-1 font-medium border-b-[4px]",
                isSelected
                    ? "border-[var(--text-light)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-light)]"
            )}
        >
            {getFeedLabel(feed.config)}
        </span>
        {hovered && !dragging && <div
            className={"absolute right-[2px] top-1/2 mb-[2px] -translate-y-1/2 hover:rounded-full hover:bg-[var(--background-dark2)] p-[2px] cursor-pointer"}
            onClick={(e) => {e.stopPropagation(); closeTab(i)}}
        >
            <CloseButtonIcon size={10}/>
        </div>}
    </BaseButton>
}