import Link from "next/link"
import {profileUrl} from "@/utils/uri";
import dynamic from "next/dynamic";
import ValidationIcon from "@/components/profile/validation-icon";
import {ProfileViewBasic as ProfileViewBasicCA, isProfileViewBasic as isProfileViewBasicCA} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {ProfileViewBasic, ProfileViewDetailed} from "@/lex-api/types/app/bsky/actor/defs";
import {$Typed} from "@atproto/api";

const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"));

type ContentTopRowAuthorProps = {
    author: $Typed<ProfileViewDetailed> | $Typed<ProfileViewBasic> | $Typed<ProfileViewBasicCA>
}

export const ContentTopRowAuthor = ({author}: ContentTopRowAuthorProps) => {
    const url = author ? profileUrl(author.handle) : ""

    const verification = isProfileViewBasicCA(author) ? author.verification : null

    return <Link
        onClick={(e) => {
            e.stopPropagation()
        }}
        href={url}
    >
        <UserSummaryOnHover handle={author.handle}>
            <div className={"flex space-x-1 items-center"}>
                <div className="hover:underline font-bold">
                {author.displayName ? author.displayName : author.handle}
                </div>
                <ValidationIcon fontSize={15} handle={author.handle} validation={verification}/>
                <div className="text-[var(--text-light)] truncate">
                    @{author.handle}
                </div>
            </div>
        </UserSummaryOnHover>
    </Link>
}