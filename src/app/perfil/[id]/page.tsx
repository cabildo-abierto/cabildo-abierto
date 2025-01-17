import { ProfilePage } from "../../../components/profile-page";
import { getUserById } from "../../../actions/users";
import { ErrorPage } from "../../../components/error-page";
import {getUsername} from "../../../components/utils";

export async function generateMetadata({params}: {params: {id: string}}){
    const {user, error} = await getUserById(params.id)

    if(!user){
        return {title: "Usuario no encontrado"}
    }

    return {
        title: "Perfil de " + getUsername(user)
    }
}


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    const username = decodeURIComponent(params?.id)

    const {user} = await getUserById(username)

    if (!user) {
        return <ErrorPage>El usuario @{username} no existe</ErrorPage>
    }

    const center = <ProfilePage
        profileUser={user}
    />

    return center
}

export default UserProfile