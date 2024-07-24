"use client"

import { follow, unfollow } from "@/actions/following"
import { useState } from "react"
import { useUser } from "./user-provider"

export function ProfileHeader({profileUser, isLoggedInUser, doesFollow, followerCount, followingCount}: any) {
    const [following, setFollowing] = useState(doesFollow)
    const {user, setUser} = useUser()

    // hay alguna mejor forma de hacer esto?
    const updatedFollowerCount = followerCount + following - doesFollow

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
                    className="blue-button"
                >
                    Dejar de seguir
                </button>
                :
                <button
                    onClick={async () => {if(!user) return; setFollowing(true); await follow(profileUser.id, user.id);}}
                    className="blue-button"
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
