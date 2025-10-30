import {RepostIcon} from "@/components/layout/icons/reposts-icon";
import {Username} from "./username";


export const RepostedBy = ({user}: {user: {displayName?: string, handle: string, did: string}}) => {
    return <div className={"text-sm flex space-x-1 items-center ml-6 text-[var(--text-light)] font-semibold mt-1"}>
        <RepostIcon fontSize={20} weight={"bold"}/> <span>Republicado por</span> <Username user={user}/>
    </div>
}