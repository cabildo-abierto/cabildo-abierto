import { ProfilePage } from "../../../components/profile-page";
import { getUserById } from "../../../actions/users";
import { ErrorPage } from "../../../components/error-page";
import {getUsername} from "../../../components/utils";

export async function generateMetadata({params}: {params: {id: string}}){
    const {atprotoProfile, error} = await getUserById(params.id)

    if(!atprotoProfile){
        return {title: "Usuario no encontrado"}
    }

    return {
        title: "Perfil de " + getUsername(atprotoProfile)
    }
}


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = decodeURIComponent(params?.id)

    const {user, atprotoProfile} = await getUserById(username)

    if(!atprotoProfile){
        return <ErrorPage>
            No se encontró el perfil {username}.
        </ErrorPage>
    }

    const center = <ProfilePage
        profileUser={user}
        atprotoProfile={atprotoProfile}
    />

    return center
}

export default UserProfile