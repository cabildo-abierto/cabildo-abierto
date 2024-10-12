import { getEntityById } from "../../actions/entities"
import { ArticlePage } from "../../components/article-page"
import { LoadingScreen } from "../../components/loading-screen"
import NoEntityPage from "../../components/no-entity-page"
import { currentVersion, entityIdToName, inRange } from "../../components/utils"
import { useEntity } from "../hooks/entities"
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

    return <ArticlePage
        entityId={searchParams.i}
        version={searchParams.v}
        userHeaders={user}
        header={header}
    />
}

export default Page