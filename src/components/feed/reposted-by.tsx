import {FeedContentReasonProps} from "../../app/lib/definitions";
import {RepostIcon} from "../icons/reposts-icon";
import Link from "next/link";
import {userUrl} from "../utils";


export const RepostedBy = ({reason}: {reason: FeedContentReasonProps}) => {
    return <div className={"text-sm flex space-x-1 items-center ml-6 text-[var(--text-light)] mt-1"}>
        <RepostIcon/> <span>Republicado por</span> <Link className="hover:underline" href={userUrl(reason.by.handle)}>{reason.by.displayName}</Link>
    </div>
}