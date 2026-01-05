import {useSession} from "@/components/auth/use-session";
import {FeedTab} from "@cabildo-abierto/api";
import {getFeedLabel} from "@/components/feed/feed/main-feed-header";
import {ArrowDownIcon, ArrowUpIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {range} from "@cabildo-abierto/utils";


const FeedReorderElement = ({feed, onMoveUp, onMoveDown, onRemove}: {
    feed: FeedTab
    onMoveUp: () => void
    onMoveDown: () => void
    onRemove: () => void
}) => {

    return <div className={"p-4 border-b flex justify-between items-center"}>
        <div className={"font-medium text-[15px]"}>
            {getFeedLabel(feed.config)}
        </div>
        <div className={"flex space-x-2"}>
            <BaseIconButton
                variant={"outlined"}
                size={"small"}
                onClick={onMoveUp}
            >
                <ArrowUpIcon/>
            </BaseIconButton>
            <BaseIconButton
                variant={"outlined"}
                size={"small"}
                onClick={onMoveDown}
            >
                <ArrowDownIcon/>
            </BaseIconButton>
            <BaseIconButton
                variant={"outlined"}
                size={"small"}
                onClick={onRemove}
            >
                <CloseButtonIcon/>
            </BaseIconButton>
        </div>
    </div>
}


export const FeedReorder = () => {
    const {user} = useSession()
    const {reorderTabs, openFeeds, closeTab} = useMainPageFeeds()

    const onMoveUp = (i: number) => () => {
        if(i > 0) {
            const order = range(openFeeds.tabs.length)
            order[i] = i-1
            order[i-1] = i
            reorderTabs(order)
        }
    }

    const onMoveDown = (i: number) => () => {
        if(i < openFeeds.tabs.length - 1) {
            const order = range(openFeeds.tabs.length)
            order[i] = i+1
            order[i+1] = i
            reorderTabs(order)
        }
    }

    return <div>
        <div>
            {user.algorithmConfig?.mainPageFeeds.tabs.map((f, i) => {
                return <FeedReorderElement
                    key={f.id}
                    feed={f}
                    onMoveDown={onMoveDown(i)}
                    onMoveUp={onMoveUp(i)}
                    onRemove={() => {closeTab(i)}}
                />
            })}
        </div>
    </div>
}