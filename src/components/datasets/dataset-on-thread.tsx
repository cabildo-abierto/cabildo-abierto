import {ProfilePic} from "../feed/profile-pic";
import {ContentTopRowAuthor} from "../content-top-row-author";
import {DatasetView} from "./dataset-view";
import {DatasetProps} from "../../app/lib/definitions";
import {useDataset} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";
import {ContentOptionsButton} from "../content-options/content-options-button";


export const DatasetOnThread = ({dataset}: {dataset: DatasetProps}) => {
    const {dataset: datasetWithData, isLoading, error} = useDataset(dataset.uri)

    return <div className={"px-2 mt-4 border-b"}>
        <div className={"flex justify-between w-full"}>
            <div className={"text-[var(--text-light)]"}>
                Dataset
            </div>
            <div>
                <ContentOptionsButton record={dataset}/>
            </div>
        </div>
        <h1>{dataset.dataset.title}</h1>
        <div className={"text-sm flex space-x-2 items-center"}>
            <ProfilePic user={dataset.author} className={"rounded-full h-4 w-4"}/>
            <ContentTopRowAuthor author={dataset.author}/>
        </div>
        {isLoading ? <LoadingSpinner/> : datasetWithData && datasetWithData.data ? <DatasetView data={datasetWithData.data}/> : <></>}
        {error && <div className={"py-4 text-center"}>
            {error}
        </div>}
    </div>
}