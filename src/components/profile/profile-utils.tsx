import {useEffect, useState} from "react";
import StateButton from "../../../modules/ui-utils/src/state-button";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {useSession} from "@/queries/api";
import {Profile} from "@/lib/types";
import {post} from "@/utils/fetch";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter} from "@/queries/updates";
import {produce} from "immer";


const follow = async ({did}: { did: string }) => {
    return await post<{ followedDid: string }, { followUri: string }>("/follow", {followedDid: did})
}


const unfollow = async ({followUri}: { followUri: string }) => {
    return await post<{ followUri: string }, {}>("/unfollow", {followUri})
}


function optimisticFollow(qc: QueryClient, handle: string) {
    qc.setQueryData(["profile", handle], old => {
        if(!old) return old
        return produce(old as Profile, draft => {
            draft.bsky.viewer.following = "optimistic-follow"
            draft.bsky.followersCount ++
            draft.bsky.followsCount ++
            draft.ca.followersCount ++
            draft.ca.followsCount ++
        })
    })
}


function optimisticUnfollow(qc: QueryClient, handle: string) {
    qc.setQueryData(["profile", handle], old => {
        if(!old) return old
        return produce(old as Profile, draft => {
            draft.bsky.viewer.following = undefined
            draft.bsky.followersCount --
            draft.bsky.followsCount --
            draft.ca.followersCount --
            draft.ca.followsCount --
        })
    })
}


function setFollow(qc: QueryClient, handle: string, followUri: string) {
    qc.setQueryData(["profile", handle], old => {
        if(!old) return old
        return produce(old as Profile, draft => {
            draft.bsky.viewer.following = followUri
        })
    })
}



export function FollowButton({handle, profile}: {
    handle: string,
    profile: { did: string, viewer?: { following?: string } }
}) {
    const qc = useQueryClient()
    const {user} = useSession()

    const followMutation = useMutation({
        mutationFn: follow,
        onMutate: (followedDid) => {
            qc.cancelQueries({predicate: (query) => {
                return query.queryKey[0] == "profile" || query.queryKey[0] == ""
            }})
            optimisticFollow(qc, handle)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.followUri) {
                setFollow(qc, handle, data.data.followUri)
            }
        },
        onSettled: async () => {
            qc.invalidateQueries({queryKey: ["profile", handle]})
        },
    })

    const unfollowMutation = useMutation({
        mutationFn: unfollow,
        onMutate: (followUri) => {
            qc.cancelQueries({queryKey: ["profile", handle]})
            optimisticUnfollow(qc, handle)
        },
        onSettled: () => {
            qc.invalidateQueries({queryKey: ["profile", handle]})
        }
    })

    const onUnfollow = async () => {
        if (profile.viewer && profile.viewer.following) {
            unfollowMutation.mutate({followUri: profile.viewer.following})
        }
        return {}
    }

    const onFollow = async () => {
        followMutation.mutate({did: profile.did})
        return {}
    }

    if (user.handle == handle) {
        return null
    }

    return <div className="flex items-center mr-2">
        {profile.viewer.following ?
        <StateButton
            handleClick={onUnfollow}
            color="background-dark"
            size="small"
            variant="contained"
            startIcon={<CheckIcon fontSize={"small"}/>}
            disableElevation={true}
            text1="Siguiendo"
            disabled={profile.viewer.following == "optimistic-follow"}
        /> :
        <StateButton
            handleClick={onFollow}
            color="primary"
            size="small"
            variant="contained"
            startIcon={<AddIcon fontSize={"small"}/>}
            disableElevation={true}
            text1="Seguir"
        />}
    </div>
}