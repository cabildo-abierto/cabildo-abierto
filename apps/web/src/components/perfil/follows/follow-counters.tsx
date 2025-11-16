import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api/dist"
import {useState} from "react";
import {FollowCount} from "./follow-counter";
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";

export const FollowCounters = ({profile}: { profile: ArCabildoabiertoActorDefs.ProfileViewDetailed }) => {
    const followersCountCA = profile.followersCount
    const followersCountAT = profile.bskyFollowersCount
    const followingCountCA = profile.followsCount
    const followingCountAT = profile.bskyFollowsCount
    const [hovered, setHovered] = useState(false)

    const showBsky = hovered || !profile.caProfile
    const className = "flex space-x-2 text-sm items-center rounded-lg py-1 " + (showBsky ? "" : "")

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
            <FollowCount
                count={followersCountCA}
                kind={"seguidores"}
                url={"/perfil/" + profile.handle + "/seguidores"}
            />
            <FollowCount
                count={followingCountCA}
                kind={"siguiendo"}
                url={"/perfil/" + profile.handle + "/siguiendo"}
            />
        </>}
        {showBsky && <>
            <FollowCount
                count={followersCountAT}
                kind={"seguidores"}
                url={"/perfil/" + profile.handle + "/seguidores"}
            />
            <FollowCount
                count={followingCountAT}
                kind={"siguiendo"}
                url={"/perfil/" + profile.handle + "/siguiendo"}
            />
            <DescriptionOnHover description={"Cantidad de seguidores y seguidos en Bluesky."}>
                <BlueskyLogo className={"h-[14px] pb-[2px] w-auto"}/>
            </DescriptionOnHover>
        </>}
    </div>
}
