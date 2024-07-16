import { getUserActivityById, getUserById, getUserId, getUserIdByUsername } from "@/actions/get-user";
import React from "react";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { doesFollow, follow, followerCount, followingCount } from "@/actions/following";
import { ProfileHeader } from "@/components/follow-button";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    let user = await getUserById("@"+params?.id)
    if (!user) {
        const center = <h1>El usuario {params?.id} no existe</h1>
        return <ThreeColumnsLayout center={center}/>
    }

    let loggedInUserId = await getUserId()

    const activity = await getUserActivityById(user.id);

    const center = <>
        <ProfileHeader
            user={user}
            isLoggedInUser={user.id == loggedInUserId}
            doesFollow={await doesFollow(user.id)}
            followerCount={await followerCount(user.id)}
            followingCount={await followingCount(user.id)}
        />
        <Feed contents={activity}/>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile