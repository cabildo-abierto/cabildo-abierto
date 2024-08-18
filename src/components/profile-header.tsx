"use client"

import { follow, unfollow } from "@/actions/following"
import { useEffect, useState } from "react"
import { useUser } from "@/app/hooks/user"
import { UserProps } from "@/app/lib/definitions"
import { useSWRConfig } from "swr"

export function ProfileHeader({profileUser}: {profileUser: UserProps}) {
    const [following, setFollowing] = useState(false)
    const user = useUser()
    const {mutate} = useSWRConfig()

    useEffect(() => {
        if(user.user)
            setFollowing(user.user.following.some((u) => u.id === profileUser.id))
    }, [user, profileUser])

    const doesFollow = user.user && user.user.following.some((u) => u.id === profileUser.id)

    const followerCount = profileUser.followedBy.length
    // hay alguna mejor forma de hacer esto?
    const updatedFollowerCount = followerCount + Number(following) - Number(doesFollow)
    const isLoggedInUser = user.user && user.user.id == profileUser.id
    const followingCount = profileUser.following.length
    
    const onFollow = async () => {
        if(!user.user) return; 
        setFollowing(false);
        await unfollow(profileUser.id, user.user.id);
        mutate("/api/following-feed/"+user.user.id)
    }

    const onUnfollow = async () => {
        if(!user.user) return
        setFollowing(true)
        await follow(profileUser.id, user.user.id)
        mutate("/api/following-feed/"+user.user.id)
    }

    return <><div className="flex justify-between">
        <div className="ml-2 py-8">
            <h3>
                {profileUser.name}
            </h3>
            <div className="text-gray-600">
                {profileUser.id}
            </div>
        </div>
        <div className="flex items-center">
            {!isLoggedInUser &&
                (following ? <button 
                    onClick={onFollow} 
                    className="gray-btn"
                >
                    Dejar de seguir
                </button>
                :
                <button
                    onClick={onUnfollow}
                    className="gray-btn"
                >
                    Seguir
                </button>)
            }
        </div>
    </div>
    <div className="ml-2 flex">
        <div>
        <span className="font-bold">{updatedFollowerCount}</span> {updatedFollowerCount == 1 ? "seguidor" : "seguidores"}
        </div>
        <div className="px-4">
        <span className="font-bold">{followingCount}</span> siguiendo
        </div>
    </div>
    </>
}
