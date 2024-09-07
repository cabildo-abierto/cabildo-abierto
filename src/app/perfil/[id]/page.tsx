import React from "react";
import { ThreeColumnsLayout } from "src/components/three-columns";
import { ProfileHeader } from "src/components/profile-header";
import { ErrorPage } from "src/components/error-page";
import { ProfileFeed } from "../../../components/profile-feed";
import { getUser, getUserById } from "src/actions/actions";
import {ProfilePage} from "../../../components/profile-page";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = decodeURIComponent(params?.id)

    
    const user = await getUserById(username)
    if (!user) {
        return <ErrorPage>El usuario @{username} no existe</ErrorPage>
    }

    const center = <ProfilePage profileUser={user}/>

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile