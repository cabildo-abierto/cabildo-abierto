"use client"
import React from "react";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ProfileHeader } from "@/components/profile-header";
import { useUsers } from "@/components/use-users";
import LoadingPage from "@/components/loading-page";
import { ErrorPage } from "@/components/error-page";


const UserProfile: React.FC<{ params: { id: string } }> = ({ params }) => {
    const {users, setUsers} = useUsers()

    if(!users){
        return <LoadingPage/>
    }

    const user = users["@"+params?.id]
    if (!user) {
        return <ErrorPage>El usuario {params?.id} no existe</ErrorPage>
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