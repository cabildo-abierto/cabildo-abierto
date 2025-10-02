import {profileUrl} from "@/utils/uri";
import dynamic from "next/dynamic";
import ValidationIcon from "@/components/profile/validation-icon";
import {$Typed} from "@/lex-api/util";
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";
import {ArCabildoabiertoActorDefs} from "@/lex-api/index"
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";

const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"), {
    ssr: false,
    loading: () => <></>
});

type ContentTopRowAuthorProps = {
    author: $Typed<ArCabildoabiertoActorDefs.ProfileViewDetailed> | $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic> | $Typed<ArCabildoabiertoActorDefs.ProfileView>
}

export const ContentTopRowAuthor = ({author}: ContentTopRowAuthorProps) => {
    const url = author ? profileUrl(author.handle) : ""

    const verification = ArCabildoabiertoActorDefs.isProfileViewBasic(author) ? author.verification : null

    return <CustomLink
        tag={"span"}
        onClick={(e) => {
            e.stopPropagation()
        }}
        href={url}
    >
        <UserSummaryOnHover handle={author.handle}>
            <div className={"flex justify-between items-center space-x-1"}>
            <div className={"flex space-x-1 items-center"}>
                <div className="hover:underline font-bold">
                {author.displayName ? author.displayName : author.handle}
                </div>
                <ValidationIcon fontSize={15} handle={author.handle} verification={verification}/>
                <div className="text-[var(--text-light)] truncate">
                    @{author.handle}
                </div>
            </div>
            {!author.caProfile && <div className={"pb-[2px]"}><BlueskyLogo className={"w-auto h-[10px]"}/></div>}
            </div>
        </UserSummaryOnHover>
    </CustomLink>
}