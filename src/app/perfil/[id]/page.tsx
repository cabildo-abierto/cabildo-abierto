import React from "react";
import { ThreeColumnsLayout } from "@/components/three-columns";
import { ProfileHeader } from "@/components/profile-header";
import { ErrorPage } from "@/components/error-page";
import { getUser, getUserById } from "@/actions/get-user";
import { ProfileFeed } from "./profile-feed";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = decodeURIComponent(params?.id)
    
    const user = await getUserById(username == "tdelgado" ? "@tdelgado" : username)
    if (!user) {
        return <ErrorPage>El usuario @{username} no existe</ErrorPage>
    }

    const loggedInUser = await getUser()

    const center = <>
        {user && <ProfileHeader
            profileUser={user} user={loggedInUser}
        />}
        <ProfileFeed profileUser={user}/>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile