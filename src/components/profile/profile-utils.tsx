import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {useUser} from "@/hooks/swr";
import {useEffect, useState} from "react";
import {follow, unfollow} from "@/server-actions/user/users";
import StateButton from "../../../modules/ui-utils/src/state-button";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {useSWRConfig} from "swr";

export function FollowButton({atprotoProfile}:{atprotoProfile: ProfileViewDetailed}){
    const {user} = useUser()
    const [following, setFollowing] = useState(atprotoProfile.viewer && atprotoProfile.viewer.following != undefined)
    const isLoggedInUser = user && user.did == atprotoProfile.did

    useEffect(() => {
        setFollowing(atprotoProfile.viewer && atprotoProfile.viewer.following != undefined)
    }, [atprotoProfile]);

    const {mutate} = useSWRConfig()

    const onUnfollow = async () => {
        if (!user) return;
        const {error} = await unfollow(atprotoProfile.viewer.following)
        if (error) return {error}
        mutate("/api/user/" + atprotoProfile.did)
        return {}
    }

    const onFollow = async () => {
        if (!user) return
        const {error} = await follow(atprotoProfile.did)
        if (error) return {error}
        mutate("/api/user/" + atprotoProfile.did)
        return {}
    }

    return user && <div className="flex items-center mr-2">
        {!isLoggedInUser &&
            (following ? <StateButton
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
            )
        }
    </div>
}