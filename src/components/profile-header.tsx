"use client"

import { follow, unfollow } from "@/actions/following"
import { useEffect, useState } from "react"
import { UserProps } from "@/actions/get-user"

export function ProfileHeader({profileUser, user}: {profileUser: UserProps, user?: UserProps}) {
    const [following, setFollowing] = useState(false)

    useEffect(() => {
        if(user)
            setFollowing(user.following.some((u) => u.id === profileUser.id))
    }, [user, profileUser])

    if(!user) return <></>

    const doesFollow = user.following.some((u) => u.id === profileUser.id)

    const followerCount = profileUser.followedBy.length
    // hay alguna mejor forma de hacer esto?
    const updatedFollowerCount = followerCount + Number(following) - Number(doesFollow)
    const isLoggedInUser = user.id == profileUser.id
    const followingCount = profileUser.following.length
    
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
                    onClick={async () => {if(!user) return; setFollowing(false); await unfollow(profileUser.id, user.id);}} 
                    className="gray-btn"
                >
                    Dejar de seguir
                </button>
                :
                <button
                    onClick={async () => {if(!user) return; setFollowing(true); await follow(profileUser.id, user.id);}}
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
