import {Profile} from "@/lib/types";
import {useState} from "react";
import {FollowCount} from "@/components/profile/follow/follow-counter";
import BlueskyLogo from "@/components/icons/bluesky-logo";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";

export const FollowCounters = ({profile}: { profile: Profile }) => {
    const followersCountCA = profile.ca ? profile.ca.followersCount : undefined
    const followersCountAT = profile.bsky.followersCount
    const followingCountCA = profile.ca ? profile.ca.followsCount : undefined
    const followingCountAT = profile.bsky.followsCount
    const [hovered, setHovered] = useState(false)

    const showBsky = hovered || !profile.ca || !profile.ca.inCA
    const className = "flex space-x-2 sm:text-base text-sm items-center rounded-lg py-1 " + (showBsky ? "" : "")

    return <div
        className={className}
        onMouseEnter={() => {
            setHovered(true)
        }}
        onMouseLeave={() => {
            setHovered(false)
        }}
    >
        {!showBsky && <>
            <FollowCount count={followersCountCA} kind={"seguidores"}
                         url={"/perfil/" + profile.bsky.handle + "/seguidores"}/>
            <FollowCount count={followingCountCA} kind={"siguiendo"}
                         url={"/perfil/" + profile.bsky.handle + "/siguiendo"}/>
        </>}
        {showBsky && <>
            <FollowCount count={followersCountAT} kind={"seguidores"}
                         url={"/perfil/" + profile.bsky.handle + "/seguidores"}/>
            <FollowCount count={followingCountAT} kind={"siguiendo"}
                         url={"/perfil/" + profile.bsky.handle + "/siguiendo"}/>
            <DescriptionOnHover description={"Cantidad de seguidores y seguidos en Bluesky."}>
                <BlueskyLogo className={"h-4 w-auto"}/>
            </DescriptionOnHover>
        </>}
    </div>
}
