import { ArticlePage } from "../../components/article-page"
import { entityIdToName } from "../../components/utils"
import { headers } from "next/headers";
import { userAgent } from "next/server";


export async function generateMetadata({searchParams}: {searchParams: {i: string, version: string}}){
    return {
        title: entityIdToName(searchParams.i)
    }
}

const Page = async ({searchParams}: {searchParams: {i: string, v?: number}}) => {
    const header = headers()
    const user = userAgent({headers: header})

    console.log("search params", searchParams)

    return <ArticlePage
        entityId={encodeURIComponent(searchParams.i)}
        version={searchParams.v}
        userHeaders={user}
        header={header}
    />
}

export default Page