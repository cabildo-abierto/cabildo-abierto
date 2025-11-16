import { ProfilePage } from "@/components/perfil/profile-page";
import {produce} from "immer";
import {mainMetadata} from "@/utils/metadata";

export async function generateMetadata({params}){
    const {id} = await params
    if(id.startsWith("did")){
        return produce(mainMetadata, draft => {
            draft.title = "Perfil - Cabildo Abierto"
        })
    } else {
        return produce(mainMetadata, draft => {
            draft.title = `@${id} - Cabildo Abierto`
        })
    }
}


const Page = async ({ params }) => {
    const {id} = await params

    return <ProfilePage
        handle={id}
    />
}

export default Page