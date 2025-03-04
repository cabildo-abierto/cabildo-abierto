"use client"
import { ProfilePage } from "../../../components/profile/profile-page";
import { ErrorPage } from "../../../components/ui-utils/error-page";
import LoadingSpinner from "../../../components/ui-utils/loading-spinner";
import {useFullProfile} from "../../../hooks/user";


const UserProfile: React.FC<{ params: { id: string } }> = ({ params }) => {
    const username = decodeURIComponent(params?.id)

    const center = <ProfilePage
        username={username}
    />

    return center
}

export default UserProfile