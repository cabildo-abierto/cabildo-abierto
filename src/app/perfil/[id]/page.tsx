import React from "react";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ProfileHeader } from "@/components/profile-header";
import { ErrorPage } from "@/components/error-page";
import { getUser, getUserById } from "@/actions/get-user";
import { getContentsMap } from "@/components/update-context";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = "@"+decodeURIComponent(params?.id)
    const user = await getUserById(username)
    if (!user) {
        return <ErrorPage>El usuario {username} no existe</ErrorPage>
    }
    const contents = await getContentsMap()
    const loggedInUser = await getUser()

    const center = <>
        {user && <ProfileHeader
            user={loggedInUser}
            profileUser={user}
        />}
        <Feed user={loggedInUser} userProfile={user} contents={contents}/>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile