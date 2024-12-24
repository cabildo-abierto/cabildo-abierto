"use client"
import {DatasetProps} from "../../app/lib/definitions";
import {useRouter} from "next/navigation";
import {ContentTopRowAuthor} from "../content-top-row-author";
import {ProfilePic} from "../feed/profile-pic";
import {ContentOptionsButton} from "../content-options/content-options-button";
import {DateSince} from "../date";


export const DatasetPreview = ({dataset}: {dataset: DatasetProps}) => {
    const router = useRouter()

    function onClick () {
        router.push("/datasets/"+dataset.cid)
    }

    return <div className={"border-b px-2 hover:bg-[var(--background-dark)] cursor-pointer py-2"} onClick={onClick}>
        <div className={"flex flex-col space-y-2"}>
            <div className={"flex justify-between"}>
                <div className={"font-bold text-lg flex"}>
                    {dataset.dataset.title}
                </div>
                <div>
                    <ContentOptionsButton options={null}/>
                </div>
            </div>
            <div className={"text-sm flex space-x-2"}>
                <ProfilePic user={dataset.author} className={"rounded-full h-4 w-4"}/>
                <ContentTopRowAuthor author={dataset.author}/>
                <span>•</span>
                <div className={"text-[var(--text-light)]"}>
                    Última actualización: <DateSince date={dataset.createdAt}/>
                </div>
            </div>
        </div>
    </div>
}