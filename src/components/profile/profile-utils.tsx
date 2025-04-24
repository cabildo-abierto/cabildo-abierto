import {useEffect, useState} from "react";
import StateButton from "../../../modules/ui-utils/src/state-button";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {useProfile, useSession} from "@/hooks/api";
import {Profile} from "@/lib/types";
import {post} from "@/utils/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query";


type FollowButtonButtonProps = {
    onFollow: () => Promise<{ error?: string }>
    onUnfollow: () => Promise<{ error?: string }>
    profile: Profile
}


export const FollowButtonButton = ({profile, onUnfollow, onFollow}: FollowButtonButtonProps) => {
    const [following, setFollowing] = useState(profile.bsky.viewer && profile.bsky.viewer.following != undefined)

    useEffect(() => {
        setFollowing(profile.bsky.viewer && profile.bsky.viewer.following != undefined)
    }, [profile]);

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


export function isLoggedInUser(handle: string, profile?: Profile) {
    return profile && profile.bsky.handle == handle
}


const follow = async ({did}: { did: string }) => {
    const {data, error} = await post<{ followedDid: string }, { followUri: string }>("/follow", {followedDid: did})
    return {...data, error}
}


const unfollow = async ({followUri}: { followUri: string }) => {
    return await post<{ followUri: string }, {}>("/unfollow", {followUri})
}


export function FollowButton({handle}: { handle: string }) {
    const queryClient = useQueryClient()
    const {user} = useSession()
    const {data: profile} = useProfile(handle)

    const followMutation = useMutation({
        mutationFn: follow,
        onSettled: ({followUri}) => {
            const previousProfile: Profile = queryClient.getQueryData(["profile", handle])
            queryClient.invalidateQueries({ queryKey: ["profile", handle] })

            console.log("followUri", followUri)
            queryClient.setQueryData(["profile", handle], {
                ...previousProfile,
                bsky: {
                    ...previousProfile.bsky,
                    viewer: {
                        ...previousProfile.bsky.viewer,
                        following: followUri
                    },
                    followersCount: profile.bsky.followersCount + 1
                },
                ca: {
                    ...previousProfile.ca,
                    followersCount: profile.ca.followersCount + 1
                }
            })
        }
    })

    const unfollowMutation = useMutation({
        mutationFn: unfollow,
        onSettled: () => {
            const previousProfile: Profile = queryClient.getQueryData(["profile", handle])
            queryClient.invalidateQueries({ queryKey: ["profile", handle] })

            queryClient.setQueryData(["profile", handle], {
                ...previousProfile,
                bsky: {
                    ...previousProfile.bsky,
                    viewer: {
                        ...previousProfile.bsky.viewer,
                        following: null
                    },
                    followersCount: profile.bsky.followersCount - 1
                },
                ca: {
                    ...previousProfile.ca,
                    followersCount: profile.ca.followersCount - 1
                }
            })
        }
    })

    const onUnfollow = async () => {
        if (profile.bsky.viewer && profile.bsky.viewer.following) {
            await unfollowMutation.mutateAsync({followUri: profile.bsky.viewer.following})
        }
        return {}
    }

    const onFollow = async () => {
        await followMutation.mutateAsync({did: profile.bsky.did})
        return {}
    }

    if (isLoggedInUser(user.handle, profile)) {
        return null
    }

    return <FollowButtonButton onFollow={onFollow} onUnfollow={onUnfollow} profile={profile}/>
}