import { ProfilePage } from "@/components/profile/profile-page";


const UserProfile = async ({ params }) => {
    const {id} = await params

    return <ProfilePage
        handle={id}
    />
}

export default UserProfile