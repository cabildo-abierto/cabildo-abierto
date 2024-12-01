import { Suspense } from "react";
import { ArticlePage } from "../../components/entity/article-page"
import { LoadingScreen } from "../../components/loading-screen";
import { entityIdToName } from "../../components/utils"
import { headers } from "next/headers";
import { userAgent } from "next/server";


export async function generateMetadata({searchParams}: {searchParams: {i: string, version: string}}){
    const name = entityIdToName(searchParams.i)
    return {
        title: name,
        description: "Artículo sobre " + name + " en Cabildo Abierto."
    }
}

const Page = async ({searchParams}: {searchParams: {i: string, v?: number, c?: string}}) => {
    const header = headers()
    const user = userAgent({headers: header})

    return <Suspense fallback={<LoadingScreen/>}>
        <ArticlePage
            entityId={encodeURIComponent(searchParams.i)}
            paramsVersion={searchParams.v}
            userHeaders={user}
            header={header}
            changes={searchParams.c == "true"}
        />
    </Suspense>
}

export default Page