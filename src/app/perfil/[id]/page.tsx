import { getUserActivityById, getUserById, getUserId } from "@/actions/get-user";
import React from "react";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { doesFollow, followerCount, followingCount } from "@/actions/following";
import { ProfileHeader } from "@/components/profile-header";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    let user = await getUserById("@"+params?.id)
    if (!user) {
        const center = <h1>El usuario {params?.id} no existe</h1>
        return <ThreeColumnsLayout center={center}/>
    }

    const center = <>
        {user && <ProfileHeader
            profileUser={user}
        />}
        <Feed userProfile={user}/>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile