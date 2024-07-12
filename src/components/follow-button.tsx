"use client"

import { follow, unfollow } from "@/actions/following"
import { useState } from "react"

export function ProfileHeader({user, isLoggedInUser, doesFollow, followerCount, followingCount}) {
    const [following, setFollowing] = useState(doesFollow)

    // hay alguna mejor forma de hacer esto?
    const updatedFollowerCount = followerCount + following - doesFollow

    return <><div className="flex justify-between">
        <div className="ml-2 py-8">
            <h3>
                {user.name}
            </h3>
            <div className="text-gray-600">
                {user.id}
            </div>
        </div>
        <div className="flex items-center">
            {!isLoggedInUser &&
                (following ? <button 
                    onClick={async () => {setFollowing(false); await unfollow(user.id);}} 
                    className="blue-button"
                >
                    Dejar de seguir
                </button>
                :
                <button
                    onClick={async () => {setFollowing(true); await follow(user.id);}}
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
