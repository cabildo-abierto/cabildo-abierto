import React from "react";
import {ProfilePage} from "../../../components/profile-page";
import { getUserById } from "../../../actions/users";
import { ErrorPage } from "../../../components/error-page";
import { ThreeColumnsLayout } from "../../../components/three-columns";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = decodeURIComponent(params?.id)

    
    const user = await getUserById(username)
    if (!user) {
        return <ErrorPage>El usuario @{username} no existe</ErrorPage>
    }

    const center = <ProfilePage
        profileUser={user}
    />

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile