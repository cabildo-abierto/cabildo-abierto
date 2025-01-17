"use client"
import {useDataset} from "../../../../hooks/contents";
import {ErrorPage} from "../../../../components/error-page";
import LoadingSpinner from "../../../../components/loading-spinner";
import {ContentTopRowAuthor} from "../../../../components/content-top-row-author";
import {ProfilePic} from "../../../../components/feed/profile-pic";
import {DatasetView} from "../../../../components/datasets/dataset-view";
import {getUri} from "../../../../components/utils";


const Page = ({params}: {params: {did: string, rkey: string}}) => {
    const {dataset, isLoading} = useDataset(getUri(params.did, "ar.com.cabildoabierto.dataset", params.rkey))

    if(isLoading) return <LoadingSpinner/>
    if(!dataset) return <ErrorPage>Error</ErrorPage>
    console.log("dataset", dataset)

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