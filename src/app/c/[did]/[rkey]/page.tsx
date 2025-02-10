import {getThread} from "../../../../actions/contents";
import {Thread} from "../../../../components/feed/thread";
import { NotFoundPage } from "../../../../components/not-found-page";


export async function generateMetadata({params}: {params: {did: string, rkey: string}}){
    return {
        title: "Cabildo Abierto"
    }
}


const ContentPage: React.FC<{params: {did: string, rkey: string}}> = async ({params}) => {
    
    const {thread} = await getThread({did: decodeURIComponent(params.did), rkey: params.rkey})

    if(!thread){
        return <NotFoundPage/>
    }

    return <Thread thread={thread}/>
}

export default ContentPage
