import {getThread} from "../../../../actions/contents";
import {Thread} from "../../../../components/feed/thread";
import {ErrorPage} from "../../../../components/error-page";


export async function generateMetadata({params}: {params: {did: string, rkey: string}}){
    return {
        title: "Cabildo Abierto"
    }
}


const ContentPage: React.FC<{params: {did: string, rkey: string}}> = async ({params}) => {
    
    const {thread} = await getThread({did: decodeURIComponent(params.did), rkey: params.rkey})

    if(!thread){
        return <ErrorPage>No pudimos encontrar el contenido.</ErrorPage>
    }

    return <Thread thread={thread}/>
}

export default ContentPage
