import dynamic from "next/dynamic";
import ValidationIcon from "../../perfil/validation-icon";
import {$Typed} from "@cabildo-abierto/api";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import {CustomLink} from "@/components/utils/base/custom-link";
import {profileUrl} from "@/components/utils/react/url";


const UserSummaryOnHover = dynamic(() => import("../../perfil/user-summary"), {
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
                    <div className={"hover:underline font-bold truncate max-w-[35%]"}>
                        {author.displayName ? author.displayName : author.handle}
                    </div>
                    <ValidationIcon fontSize={15} handle={author.handle} verification={verification}/>
                    <div className={"text-[var(--text-light)] truncate max-w-[25%]"}>
                        @{author.handle}
                    </div>
                </div>
                {!author.caProfile && <div className={"pb-[2px]"}><BlueskyLogo className={"w-auto h-[10px]"}/></div>}
            </div>
        </UserSummaryOnHover>
    </CustomLink>
}