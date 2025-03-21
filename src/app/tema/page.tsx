import { TopicPage } from "../../components/topic/topic-page"

type Params = Promise<{i: string, v?: number}>

export async function generateMetadata({searchParams}: {searchParams: Params}){
    const {i} = await searchParams
    return {
        title: i,
        description: "Artículo sobre " + i + " en Cabildo Abierto."
    }
}

const Page = async ({searchParams}: {
    searchParams: Params}) => {
    const {i} = await searchParams

    return <TopicPage
        topicId={i}
    />
}

export default Page