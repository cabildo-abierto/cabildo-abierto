import { ProfilePage } from "@/components/profile/profile-page";


const UserProfile = async ({ params }) => {
    const {id} = await params

    return <ProfilePage
        handleOrDid={id}
    />
}

export default UserProfile