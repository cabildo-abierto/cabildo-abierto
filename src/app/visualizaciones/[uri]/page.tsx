"use client"
import {ThreeColumnsLayout} from "../../../components/three-columns";
import {useDataset, useDatasets} from "../../../hooks/contents";
import {ErrorPage} from "../../../components/error-page";
import LoadingSpinner from "../../../components/loading-spinner";
import {ContentTopRowAuthor} from "../../../components/content-top-row-author";
import {ProfilePic} from "../../../components/feed/profile-pic";
import {DatasetView} from "../../../components/datasets/dataset-view";


const Page = ({params}: {params: {uri: string}}) => {
    const {dataset, isLoading} = useDataset(params.uri)

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

    return <ThreeColumnsLayout
    center={center}/>
}

export default Page;