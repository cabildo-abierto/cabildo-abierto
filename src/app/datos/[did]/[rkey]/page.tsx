"use client"
import {useDataset} from "../../../../hooks/swr";
import {ErrorPage} from "../../../../../modules/ui-utils/src/error-page";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import {ContentTopRowAuthor} from "@/components/feed/frame/content-top-row-author";
import {ProfilePic} from "../../../../components/profile/profile-pic";
import {DatasetView} from "../../../../components/datasets/dataset-view";
import {use} from "react";
import {getUri} from "../../../../utils/uri";


const Page = ({params}: {params: Promise<{did: string, rkey: string}>}) => {
    const {did, rkey} = use(params)
    const {dataset, isLoading} = useDataset(getUri(did, "ar.com.cabildoabierto.dataset", rkey))

    if(isLoading) return <LoadingSpinner/>
    if(!dataset) return <ErrorPage>Error</ErrorPage>

    const center = <div className={"px-2 mt-4"}>
        <div className={"text-[var(--text-light)]"}>
            Dataset
        </div>
        <h1>{dataset.dataset.dataset.title}</h1>
        <div className={"text-sm flex space-x-2 items-center"}>
            <ProfilePic user={dataset.dataset.author} className={"rounded-full h-4 w-4"}/>
            <ContentTopRowAuthor author={dataset.dataset.author}/>
        </div>
        <DatasetView data={dataset.data}/>
    </div>

    return center
}

export default Page;