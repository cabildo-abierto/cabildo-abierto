import StateButton from "../../../modules/ui-utils/src/state-button";
import {useSession} from "@/queries/getters/useSession";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {post} from "@/utils/fetch";
import {Query, QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {darker} from "../../../modules/ui-utils/src/button";
import {InfiniteFeed} from "@/components/feed/feed/feed";
import {AppBskyActorDefs} from "@atproto/api"
import {Color} from "../../../modules/ui-utils/src/color";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {CheckIcon, PlusIcon} from "@phosphor-icons/react";

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
                    return produce(old as ArCabildoabiertoActorDefs.ProfileViewDetailed, draft => {
                        if(draft.viewer) draft.viewer.following = "optimistic-follow"
                        draft.bskyFollowersCount++
                        draft.followersCount++
                    })
                } else if (k[0] == "user-search" || k[0] == "followers" || k[0] == "follows") {
                    if (!old) return old
                    return produce(old as ArCabildoabiertoActorDefs.ProfileViewBasic[], draft => {
                        const index = (old as ArCabildoabiertoActorDefs.ProfileViewBasic[]).findIndex(u => u.handle == handle)
                        if (index != -1) {
                            if(draft[index].viewer) draft[index].viewer.following = "optimistic-follow"
                        }
                    })
                } else if(k[0] == "follow-suggestions"){
                    if (!old) return old
                    return produce(old as {profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[]}, draft => {
                        const index = draft.profiles.findIndex(u => u.handle == handle)
                        if (index != -1) {
                            if(draft.profiles[index].viewer) draft.profiles[index].viewer.following = "optimistic-follow"
                        }
                    })
                } else if(k[0] == "follow-suggestions-feed") {
                    if(!old) return old
                    return produce(old as InfiniteFeed<ArCabildoabiertoActorDefs.ProfileViewBasic>, draft => {
                        for(let i = 0; i < draft.pages.length; i++){
                            const index = draft.pages[i].data.findIndex(u => u.handle == handle)
                            if (index != -1) {
                                draft.pages[i].data[index].viewer.following = "optimistic-follow"
                            }
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
                    return produce(old as ArCabildoabiertoActorDefs.ProfileViewDetailed, draft => {
                        draft.viewer.following = undefined
                        draft.bskyFollowersCount--
                        draft.followersCount--
                    })
                } else if (k[0] == "user-search" || k[0] == "followers" || k[0] == "follows") {
                    if (!old) return old
                    return produce(old as ArCabildoabiertoActorDefs.ProfileViewBasic[], draft => {
                        const index = (old as ArCabildoabiertoActorDefs.ProfileViewBasic[]).findIndex(u => u.handle == handle)
                        if (index != -1) {
                            draft[index].viewer.following = undefined
                        }
                    })
                } else if(k[0] == "follow-suggestions"){
                    if (!old) return old
                    return produce(old as {profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[]}, draft => {
                        const index = draft.profiles.findIndex(u => u.handle == handle)
                        if (index != -1) {
                            draft.profiles[index].viewer.following = undefined
                        }
                    })
                } else if(k[0] == "follow-suggestions-feed") {
                    if(!old) return old
                    return produce(old as InfiniteFeed<ArCabildoabiertoActorDefs.ProfileViewBasic>, draft => {
                        for(let i = 0; i < draft.pages.length; i++){
                            const index = draft.pages[i].data.findIndex(u => u.handle == handle)
                            if (index != -1) {
                                draft.pages[i].data[index].viewer.following = undefined
                            }
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
                    return produce(old as ArCabildoabiertoActorDefs.ProfileViewDetailed, draft => {
                        draft.viewer.following = followUri
                    })
                } else if (k[0] == "user-search" || k[0] == "followers" || k[0] == "follows") {
                    if (!old) return old
                    return produce(old as ArCabildoabiertoActorDefs.ProfileViewBasic[], draft => {
                        const index = draft.findIndex(u => u.handle == handle)
                        if (index != -1) {
                            draft[index].viewer.following = followUri
                        }
                    })
                } else if(k[0] == "follow-suggestions-feed") {
                    if(!old) return old
                    return produce(old as InfiniteFeed<ArCabildoabiertoActorDefs.ProfileViewBasic>, draft => {
                        for(let i = 0; i < draft.pages.length; i++){
                            const index = draft.pages[i].data.findIndex(u => u.handle == handle)
                            if (index != -1) {
                                draft.pages[i].data[index].viewer.following = followUri
                            }
                        }
                    })
                }
            })
        })
}

const isQueryRelatedToFollow = (query: Query) => {
    return query.queryKey[0] == "profile" ||
        query.queryKey[0] == "user-search" ||
        query.queryKey[0] == "followers" ||
        query.queryKey[0] == "follows" ||
        query.queryKey[0] == "follow-suggestions" ||
        query.queryKey[0] == "follow-suggestions-feed"
}


export function FollowButton({
                                 handle,
                                 profile,
                                 backgroundColor="background",
                                 textClassName,
                                 dense=false
}: {
    handle: string,
    profile: AppBskyActorDefs.ProfileViewDetailed | AppBskyActorDefs.ProfileViewBasic | ArCabildoabiertoActorDefs.ProfileViewBasic | ArCabildoabiertoActorDefs.ProfileViewDetailed
    backgroundColor?: Color
    textClassName?: string
    dense?: boolean
}) {
    const qc = useQueryClient()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()

    const followMutation = useMutation({
        mutationFn: follow,
        onMutate: () => {
            try {
                optimisticFollow(qc, handle)
            } catch (err) {
                console.log("follow failed", err)
            }
        },
        onSuccess: (data) => {
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
        onMutate: (f) => {
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
        if(user) {
            if (profile.viewer && profile.viewer.following) {
                unfollowMutation.mutate({followUri: profile.viewer.following})
            }
        } else {
            setLoginModalOpen(true)
        }
        return {}
    }

    const onFollow = async () => {
        if(user) {
            followMutation.mutate({did: profile.did})
        } else {
            setLoginModalOpen(true)
        }
        return {}
    }

    if (user && user.handle == handle) {
        return null
    }

    const followText = profile.viewer?.followedBy && !dense ? "Seguir también" : "Seguir"

    return <div className="flex items-center">
        {profile.viewer?.following ?
            <StateButton
                handleClick={onUnfollow}
                color={darker(backgroundColor)}
                size="small"
                variant="outlined"
                startIcon={!dense && <CheckIcon size={14}/>}
                disableElevation={true}
                paddingX={dense ? "5px" : undefined}
                paddingY={dense ? 0 : undefined}
                text1="Siguiendo"
                textClassName={textClassName + " uppercase"}
                disabled={profile.viewer?.following == "optimistic-follow"}
            /> :
            <StateButton
                handleClick={onFollow}
                color={darker(backgroundColor)}
                size="small"
                variant="outlined"
                startIcon={!dense && <PlusIcon size={14}/>}
                disableElevation={true}
                paddingX={dense ? "5px" : undefined}
                paddingY={dense ? 0 : undefined}
                text1={followText}
                textClassName={textClassName + " uppercase"}
            />}
    </div>
}