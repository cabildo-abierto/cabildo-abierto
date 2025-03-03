"use client"
import { ProfilePage } from "../../../components/profile/profile-page";
import { ErrorPage } from "../../../components/ui-utils/error-page";
import LoadingSpinner from "../../../components/ui-utils/loading-spinner";
import {useFullProfile} from "../../../hooks/user";


const UserProfile: React.FC<{ params: { id: string } }> = ({ params }) => {
    const username = decodeURIComponent(params?.id)
    const {user, atprotoProfile, isLoading, error} = useFullProfile(username)

    if(isLoading){
        return <div className={"mt-8"}><LoadingSpinner/></div>
    }

    if(error){
        return <ErrorPage>{error}</ErrorPage>
    }

    const center = <ProfilePage
        profileUser={user}
        atprotoProfile={atprotoProfile}
    />

    return center
}

export default UserProfile