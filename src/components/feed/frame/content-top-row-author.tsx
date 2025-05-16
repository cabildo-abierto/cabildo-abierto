import Link from "next/link"
import {profileUrl} from "@/utils/uri";
import dynamic from "next/dynamic";

const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"));


export const ContentTopRowAuthor = ({author}: { author: { handle: string, displayName?: string } }) => {
    const url = author ? profileUrl(author.handle) : ""

    return <Link
        onClick={(e) => {
            e.stopPropagation()
        }}
        href={url}
    >
        <UserSummaryOnHover handle={author.handle}>
            <div className={"truncate"}>
        <span className="hover:underline font-bold mr-1">
        {author.displayName ? author.displayName : author.handle}
        </span>
                <span className="text-[var(--text-light)]">
            @{author.handle}
        </span>
            </div>
        </UserSummaryOnHover>
    </Link>
}