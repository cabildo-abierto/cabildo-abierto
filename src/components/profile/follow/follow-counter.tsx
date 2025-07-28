import {FollowKind} from "@/components/profile/follow/followx-page";
import Link from "next/link";
import {rounder} from "@/utils/strings";


type FollowCountProps = { count: number, kind: FollowKind, url?: string }

export const FollowCount = ({count, kind, url}: FollowCountProps) => {
    const label = kind == "siguiendo" ? kind : (count == 1 ? "seguidor" : "seguidores")
    return <ProfileCount count={count} label={label} url={url}/>
}


export const ProfileCount = ({count, label, url}: {count: number, label: string, url?: string}) => {
    return <div className="sm:text-base text-sm flex space-x-1">
        <span className="font-bold">
            {count != undefined ? rounder(count) : "?"}
        </span>
        {url && <Link className={"text-[var(--text-light)] hover:underline"} href={url}>
            {label}
        </Link>}
        {!url && <span className={"text-[var(--text-light)]"}>
            {label}
        </span>}
    </div>
}