import React from "react"
import { getPostsFollowing } from "@/actions/get-content";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { requireSubscription } from "@/components/utils";
import { ErrorPage } from "@/components/error-page";


const Siguiendo: React.FC = async () => {
    const feed = await getPostsFollowing()
    if(!feed) return <ErrorPage>No se pudo encontrar el feed</ErrorPage>

    const center = <div className="bg-white h-full">
        <h2 className="ml-2 py-8">
            Siguiendo
        </h2>
        <Feed contents={feed}/>
    </div>

    return requireSubscription(<ThreeColumnsLayout center={center} />, true)
}

export default Siguiendo