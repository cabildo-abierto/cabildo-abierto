import {ProfilePic} from "../feed/profile-pic";
import {ContentTopRowAuthor} from "../content-top-row-author";
import {DatasetView} from "./dataset-view";
import {DatasetProps} from "../../app/lib/definitions";
import {useDataset} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";


export const DatasetOnThread = ({dataset}: {dataset: DatasetProps}) => {
    const {dataset: datasetWithData, isLoading} = useDataset(dataset.uri)

    return <div className={"px-2 mt-4 border-b"}>
        <div className={"text-[var(--text-light)]"}>
            Dataset
        </div>
        <h1>{dataset.dataset.title}</h1>
        <div className={"text-sm flex space-x-2 items-center"}>
            <ProfilePic user={dataset.author} className={"rounded-full h-4 w-4"}/>
            <ContentTopRowAuthor author={dataset.author}/>
        </div>
        {isLoading ? <LoadingSpinner/> : datasetWithData.data ? <DatasetView data={datasetWithData.data}/> : <></>}
    </div>
}