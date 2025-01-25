import {ContentOptionsButton} from "../content-options/content-options-button";
import {ProfilePic} from "../feed/profile-pic";
import {ContentTopRowAuthor} from "../content-top-row-author";
import Link from "next/link";
import {datasetViewUrl} from "../utils";
import {VisualizationProps} from "../../app/lib/definitions";
import dynamic from "next/dynamic";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});


export const Visualization = ({visualization}: {visualization: VisualizationProps}) => {
    return <div className={"px-2 mt-4 space-y-2 pb-2 border-b"}>
        <div className={"flex justify-between items-center"}>
            <div className={"font-bold text-xl"}>
                Visualización
            </div>
            <div>
                <ContentOptionsButton options={<></>}/>
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
}