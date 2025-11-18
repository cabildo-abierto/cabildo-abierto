import Link from "next/link";
import {rounder} from "@cabildo-abierto/utils";
import {FollowKind} from "./types";


type FollowCountProps = { count: number | undefined, kind: FollowKind, url?: string }

export const FollowCount = ({count, kind, url}: FollowCountProps) => {
    const label = kind == "siguiendo" ? kind : (count == 1 ? "seguidor" : "seguidores")
    return <ProfileCount
        count={count}
        label={label}
        url={url}
    />
}


export const ProfileCount = ({count, label, url}: {
    count: number | undefined,
    label: string,
    url?: string
}) => {
    return <span className="sm:text-base text-sm">
        <span className="font-bold">
            {count != undefined ? rounder(count) : "?"}
        </span> {url && <Link className={"text-[var(--text-light)] hover:underline"} href={url}>
            {label}
        </Link>} {!url && <span className={"text-[var(--text-light)]"}>
            {label}
        </span>}
    </span>
}