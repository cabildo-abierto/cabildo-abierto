import StateButton from "../../../modules/ui-utils/src/state-button";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {useSession} from "@/queries/api";
import {Profile} from "@/lib/types";
import {post} from "@/utils/fetch";
import {Query, QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {ProfileViewBasic} from "@/lex-api/types/app/bsky/actor/defs";
import {Color, darker} from "../../../modules/ui-utils/src/button";
import {useEffect} from "react";


const follow = async ({did}: { did: string }) => {
    return await post<{ followedDid: string }, { followUri: string }>("/follow", {followedDid: did})
}


const unfollow = async ({followUri}: { followUri: string }) => {
    return await post<{ followUri: string }, {}>("/unfollow", {followUri})
}


function optimisticFollow(qc: QueryClient, handle: string) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && isQueryRelatedToFollow(q))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                const k = q.queryKey

                if (k[0] == "profile" && k[1] == handle) {
                    if (!old) return old
                    return produce(old as Profile, draft => {
                        draft.bsky.viewer.following = "optimistic-follow"
                        draft.bsky.followersCount++
                        draft.ca.followersCount++
                    })
                } else if (k[0] == "user-search" || k[0] == "followers" || k[0] == "follows") {
                    if (!old) return old
                    return produce(old as ProfileViewBasic[], draft => {
                        const index = (old as ProfileViewBasic[]).findIndex(u => u.handle == handle)
                        if (index != -1) {
                            draft[index].viewer.following = "optimistic-follow"
                        }
                    })
                }
            })
        })
}


function optimisticUnfollow(qc: QueryClient, handle: string) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && isQueryRelatedToFollow(q))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                const k = q.queryKey

                if (k[0] == "profile" && k[1] == handle) {
                    if (!old) return old
                    return produce(old as Profile, draft => {
                        draft.bsky.viewer.following = undefined
                        draft.bsky.followersCount--
                        draft.ca.followersCount--
                    })
                } else if (k[0] == "user-search" || k[0] == "followers" || k[0] == "follows") {
                    if (!old) return old
                    return produce(old as ProfileViewBasic[], draft => {
                        const index = (old as ProfileViewBasic[]).findIndex(u => u.handle == handle)
                        if (index != -1) {
                            draft[index].viewer.following = undefined
                        }
                    })
                }
            })
        })
}


function setFollow(qc: QueryClient, handle: string, followUri: string) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && isQueryRelatedToFollow(q))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                const k = q.queryKey

                if (k[0] == "profile" && k[1] == handle) {
                    if (!old) return old
                    return produce(old as Profile, draft => {
                        draft.bsky.viewer.following = followUri
                    })
                } else if (k[0] == "user-search" || k[0] == "followers" || k[0] == "follows") {
                    if (!old) return old
                    return produce(old as ProfileViewBasic[], draft => {
                        const index = (old as ProfileViewBasic[]).findIndex(u => u.handle == handle)
                        if (index != -1) {
                            draft[index].viewer.following = followUri
                        }
                    })
                }
            })
        })
}

const isQueryRelatedToFollow = (query: Query) => {
    return query.queryKey[0] == "profile" || query.queryKey[0] == "user-search" || query.queryKey[0] == "followers" || query.queryKey[0] == "follows"
}


export function FollowButton({handle, profile, backgroundColor="background", textClassName, dense=false}: {
    handle: string,
    profile: { did: string, viewer?: { following?: string } }
    backgroundColor?: Color
    textClassName?: string
    dense?: boolean
}) {
    const qc = useQueryClient()
    const {user} = useSession()

    const followMutation = useMutation({
        mutationFn: follow,
        onMutate: (followedDid) => {
            qc.cancelQueries({
                predicate: (query: Query) => {
                    return isQueryRelatedToFollow(query)
                }
            })
            optimisticFollow(qc, handle)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.followUri) {
                setFollow(qc, handle, data.data.followUri)
            }
        },
        onSettled: async () => {
            qc.invalidateQueries({
                predicate: (query: Query) => {
                    return isQueryRelatedToFollow(query)
                }
            })
        },
    })

    const unfollowMutation = useMutation({
        mutationFn: unfollow,
        onMutate: (followUri) => {
            qc.cancelQueries({
                predicate: (query: Query) => {
                    return isQueryRelatedToFollow(query)
                }
            })
            optimisticUnfollow(qc, handle)
        },
        onSettled: () => {
            qc.invalidateQueries({
                predicate: (query: Query) => {
                    return isQueryRelatedToFollow(query)
                }
            })
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

    return <div className="flex items-center">
        {profile.viewer.following ?
            <StateButton
                handleClick={onUnfollow}
                color={darker(backgroundColor)}
                size="small"
                variant="contained"
                startIcon={!dense && <CheckIcon fontSize={"small"}/>}
                disableElevation={true}
                dense={dense}
                text1="Siguiendo"
                textClassName={textClassName}
                disabled={profile.viewer.following == "optimistic-follow"}
            /> :
            <StateButton
                handleClick={onFollow}
                color="primary"
                size="small"
                variant="contained"
                startIcon={!dense && <AddIcon fontSize={"small"}/>}
                disableElevation={true}
                dense={dense}
                text1="Seguir"
                textClassName={textClassName}
            />}
    </div>
}