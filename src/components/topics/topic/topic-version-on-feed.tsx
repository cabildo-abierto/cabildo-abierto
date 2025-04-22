import {TopicVersionOnFeedProps} from "@/lib/types";
import {ContentTopRowAuthor} from "../../feed/content-top-row-author";
import {ProfilePic} from "../../feed/profile-pic";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {useRouter} from "next/navigation";
import {topicUrl} from "../../../utils/uri";
import {formatIsoDate} from "../../../utils/dates";


const CharDiff = ({diff}: {diff: {charsAdded?: number, charsDeleted?: number}}) => {
    if(diff.charsAdded == undefined) return null
    if(diff.charsDeleted == undefined) return null
    return <div className={"flex"}>
        (<span className={"text-green-400"}>+{diff.charsAdded} </span>
        <span className={"text-red-400"}>-{diff.charsDeleted}</span>)
    </div>
}

export const TopicVersionOnFeed = ({topicVersion}: {topicVersion: TopicVersionOnFeedProps}) => {
    const router = useRouter()

    return <div className={"flex flex-col w-full p-2 border-b hover:bg-[var(--background-dark)] cursor-pointer"}
        onClick={() => {router.push(topicUrl(topicVersion.content.topicVersion.topic.id))}}
    >
        <div className={"text-sm flex space-x-1"}>
            <ProfilePic user={topicVersion.author} className={"w-5 h-5 rounded-full mr-1"}/>
            <div className="flex gap-x-1 max-w-[calc(100vw-80px)]">
                <span className="truncate">
                        <ContentTopRowAuthor author={topicVersion.author}/>
                </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(topicVersion.createdAt)}>
                        <DateSince date={topicVersion.createdAt}/>
                </span>
            </div>
        </div>
        <div className={"px-2 mt-2 space-x-1"}>
            <span>
                Nueva versión de
            </span>
            <span className={"font-bold"}>
                {topicVersion.content.topicVersion.topic.id}
            </span>
            <CharDiff diff={topicVersion.content.topicVersion}/>.
        </div>
    </div>
}