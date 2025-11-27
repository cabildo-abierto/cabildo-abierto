import {profileUrl} from "@/components/utils/react/url";
import {ProfilePic} from "@/components/perfil/profile-pic";
import {FollowButton} from "@/components/perfil/follows";
import {CustomLink} from "@/components/utils/base/custom-link";
import { ArCabildoabiertoActorDefs } from "@cabildo-abierto/api";


export const FollowSuggestionSmallView = ({
    user
                                          }: {
    user: ArCabildoabiertoActorDefs.ProfileViewBasic
}) => {
    return <CustomLink
        tag={"div"}
        href={profileUrl(user.handle)}
        className="hover:bg-[var(--background-dark)] flex space-x-2 justify-between p-2 items-center"
    >
        <div className="flex space-x-2 items-center w-full">
            <div>
                <ProfilePic
                    user={user}
                    className={"rounded-full w-8 h-8"}
                />
            </div>
            <div className={"space-y-[-2px] text-ellipsis"}>
                <div className={"text-sm font-semibold truncate w-32"}>
                    {user.displayName ? user.displayName : `@${user.handle}`}
                </div>
                <div className={"text-xs text-[var(--text-light)] truncate w-32"}>
                    @{user.handle}
                </div>
            </div>
        </div>
        <FollowButton
            dense={true}
            handle={user.handle}
            profile={user}
        />
    </CustomLink>
}