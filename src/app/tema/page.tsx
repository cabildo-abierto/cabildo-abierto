import { TopicPage } from "../../components/topic/topic-page"


export async function generateMetadata({searchParams}: {searchParams: {i: string, version: string}}){
    const name = searchParams.i
    return {
        title: name,
        description: "Artículo sobre " + name + " en Cabildo Abierto."
    }
}

const Page = async ({searchParams}: {searchParams: {i: string, v?: number, c?: string}}) => {

    return <TopicPage
        topicId={encodeURIComponent(searchParams.i)}
        paramsVersion={searchParams.v}
        changes={searchParams.c == "true"}
    />
}

export default Page