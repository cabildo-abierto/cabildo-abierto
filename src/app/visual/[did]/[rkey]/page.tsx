"use client"
import {ContentTopRowAuthor} from "../../../../components/content-top-row-author";
import {datasetViewUrl, getUri} from "../../../../components/utils";
import {useVisualization} from "../../../../hooks/contents";
import LoadingSpinner from "../../../../components/loading-spinner";
import {ProfilePic} from "../../../../components/feed/profile-pic";
import Link from "next/link";
import {ContentOptionsButton} from "../../../../components/content-options/content-options-button";
import dynamic from "next/dynamic";
import {ContentOptions} from "../../../../components/content-options/content-options";
import {useUser} from "../../../../hooks/user";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});


const Page = ({params}: {params: {did: string, rkey: string}}) => {
    const {visualization, isLoading} = useVisualization(getUri(params.did, "ar.com.cabildoabierto.visualization", params.rkey));
    const {user} = useUser()

    if(isLoading) return <LoadingSpinner/>
    if(!visualization) return <></>

    const center = <div className={"px-2 mt-4 space-y-2 pb-2 border-b"}>
        <div className={"flex justify-between items-center"}>
            <div className={"font-bold text-xl"}>
                Visualización
            </div>
            <div>
                <ContentOptionsButton record={visualization}/>
            </div>
        </div>
        <div className={"flex items-center space-x-2 text-sm"}>
            <ProfilePic user={visualization.author} className={"w-5 h-5 rounded-full"}/>
            <ContentTopRowAuthor author={visualization.author}/>
        </div>
        <div className={"flex space-x-1 text-sm"}>
            <div>Datos:</div>
            <Link
                className={"border rounded-lg hover:bg-[var(--background-dark)] px-1"}
                href={datasetViewUrl(visualization.visualization.dataset.uri)}
            >{visualization.visualization.dataset.dataset.title}
            </Link>
        </div>
        <div className={"flex justify-center mt-4"}>
            <VegaLite spec={JSON.parse(visualization.visualization.spec)} actions={false}/>
        </div>
    </div>

    return center
}

export default Page;