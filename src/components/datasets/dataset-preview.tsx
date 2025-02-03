"use client"
import {DatasetProps} from "../../app/lib/definitions";
import {useRouter} from "next/navigation";
import {FastPostPreviewFrame} from "../feed/fast-post-preview-frame";
import {PostTitleOnFeed} from "../feed/post-title-on-feed";
import {ContentOptions} from "../content-options/content-options";
import {useUser} from "../../hooks/user";


export const DatasetPreview = ({dataset}: {dataset: DatasetProps}) => {

    return <FastPostPreviewFrame
        post={dataset}
    >
        <div className={"flex flex-col"}>
            <PostTitleOnFeed title={dataset.dataset.title}/>
            <div className={"text-[var(--text-light)] mt-1 flex space-x-2"}>
                <div>
                    {dataset.dataset.columns.length} columnas
                </div>
                <div>
                    {/*arraySum(dataset.dataset.dataBlocks, (b) => (b.))*/}
                </div>
            </div>
        </div>
    </FastPostPreviewFrame>

    /*return <div className={"px-2 hover:bg-[var(--background-dark)] cursor-pointer py-2"} onClick={onClick}>
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
    </div>*/
}