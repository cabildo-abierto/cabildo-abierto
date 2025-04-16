import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {useFullProfile, useUser} from "@/hooks/swr";
import {useEffect, useState} from "react";
import {follow, getFullProfileById, getUserById, unfollow} from "@/server-actions/user/users";
import StateButton from "../../../modules/ui-utils/src/state-button";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {useSWRConfig} from "swr";


type FollowButtonButtonProps = {
    onFollow: () => Promise<{ error?: string }>
    onUnfollow: () => Promise<{ error?: string }>
    atprotoProfile: ProfileViewDetailed
}


export const FollowButtonButton = ({atprotoProfile, onUnfollow, onFollow}: FollowButtonButtonProps) => {
    const [following, setFollowing] = useState(atprotoProfile.viewer && atprotoProfile.viewer.following != undefined)

    useEffect(() => {
        setFollowing(atprotoProfile.viewer && atprotoProfile.viewer.following != undefined)
    }, [atprotoProfile]);

    return <div className="flex items-center mr-2">
        {following ? <StateButton
                    handleClick={onUnfollow}
                    color="inherit"
                    size="small"
                    variant="contained"
                    startIcon={<CheckIcon fontSize={"small"}/>}
                    disableElevation={true}
                    text1="Siguiendo"
                />
                :
                <StateButton
                    handleClick={onFollow}
                    color="primary"
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon fontSize={"small"}/>}
                    disableElevation={true}
                    text1="Seguir"
                />
        }
    </div>
}


export function FollowButton({handle}: {handle: string}){
    const {user} = useUser()
    const {atprotoProfile, user: caUser} = useFullProfile(handle)
    const {mutate} = useSWRConfig()

    if(!atprotoProfile) {
        return <div>
            {handle}
        </div>
    }

    const isLoggedInUser = user && user.did == atprotoProfile.did
    if(isLoggedInUser) return null

    const onUnfollow = async () => {
        if (!user) return;
        const {error} = await unfollow(atprotoProfile.handle, atprotoProfile.viewer.following)
        if (error) return {error}
        mutate(
            "/api/user/" + atprotoProfile.handle,
            async () => {return await getFullProfileById(atprotoProfile.handle)},
            {
                optimisticData: {
                    atprotoProfile: {
                        ...atprotoProfile,
                        viewer: {
                            ...atprotoProfile.viewer,
                            following: null
                        },
                        followersCount: atprotoProfile.followersCount - 1
                    },
                    user: {
                        ...caUser,
                        followersCount: caUser.followersCount - 1
                    }
                }
            }
        )
        return {}
    }

    const onFollow = async () => {
        if (!user) return
        const {error, followUri} = await follow(atprotoProfile.did, atprotoProfile.handle)
        if (error) return {error}
        mutate(
            "/api/user/" + atprotoProfile.handle,
            async () => {return await getFullProfileById(atprotoProfile.handle)},
            {
                optimisticData: {
                    atprotoProfile: {
                        ...atprotoProfile,
                        viewer: {
                            ...atprotoProfile.viewer,
                            following: followUri
                        },
                        followersCount: atprotoProfile.followersCount + 1
                    },
                    user: {
                        ...caUser,
                        followersCount: caUser.followersCount + 1
                    }
                }
            }
        )
        return {}
    }

    return <FollowButtonButton onFollow={onFollow} onUnfollow={onUnfollow} atprotoProfile={atprotoProfile}/>
}