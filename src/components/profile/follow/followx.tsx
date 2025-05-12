import {useFollowx} from "@/hooks/api";
import {FollowKind} from "@/components/profile/follow/followx-page";
import Link from "next/link";
import {rounder} from "@/utils/strings";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import dynamic from "next/dynamic";

const UserSearchResult = dynamic(() => import("@/components/buscar/user-search-result"), {ssr: false});

type FollowCountProps = { count: number, kind: FollowKind, url?: string }

export const FollowCount = ({count, kind, url}: FollowCountProps) => {
    const text = kind == "siguiendo" ? kind : (count == 1 ? "seguidor" : "seguidores")
    return <div className="sm:text-base text-sm flex space-x-1">
        <span className="font-bold">
            {count != undefined ? rounder(count) : "?"}
        </span>
        {url && <Link className={"text-[var(--text-light)] hover:underline"} href={url}>
            {text}
        </Link>}
        {!url && <span className={"text-[var(--text-light)]"}>
            {text}
        </span>}
    </div>
}


export const Followx = ({handle, kind}: { handle: string, kind: FollowKind }) => {
    const {data, isLoading} = useFollowx(handle, kind)

    if (isLoading) return <div className={"py-4"}>
        <LoadingSpinner/>
    </div>

    return <div>
        <div className={"w-full flex p-2 border-b text-sm"}>
            <FollowCount count={data.length} kind={kind}/>
        </div>
        {data.map((user) => {
            return <div key={user.did}>
                <UserSearchResult user={user}/>
            </div>
        })}
    </div>
}