import { Suspense } from "react";
import { ArticlePage } from "../../components/article-page"
import { LoadingScreen } from "../../components/loading-screen";
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

    return <Suspense fallback={<div className="w-screen h-screen fixed inset-0 bg-red-600">.</div>}>
        <ArticlePage
            entityId={encodeURIComponent(searchParams.i)}
            version={searchParams.v}
            userHeaders={user}
            header={header}
        />
    </Suspense>
}

export default Page