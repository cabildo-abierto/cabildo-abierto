import { ProfilePage } from "../../../components/profile-page";
import { getUserById } from "../../../actions/users";
import { ErrorPage } from "../../../components/error-page";
import { ThreeColumnsLayout } from "../../../components/three-columns";
import { FullProfile } from "../../../components/profile-header";
import {getUsername} from "../../../components/utils";

export async function generateMetadata({params}: {params: {id: string}}){
    const {bskyProfile, error} = await getUserById(params.id)

    if(!bskyProfile){
        return {title: "Usuario no encontrado"}
    }

    return {
        title: "Perfil de " + getUsername(bskyProfile)
    }
}


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = decodeURIComponent(params?.id)

    const user = await getUserById(username)

    if (!user.bskyProfile) {
        return <ErrorPage>El usuario @{username} no existe</ErrorPage>
    }

    const center = <ProfilePage
        profileUser={user as FullProfile}
    />

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile