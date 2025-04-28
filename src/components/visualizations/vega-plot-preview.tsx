import Image from "next/image";

type VisualizationProps = any // TO DO

export const VegaPlotPreview = ({visualization, width, height} : {
    visualization: VisualizationProps
    width?: number | string
    height?: number | string
}) => {
    const previewCid = visualization.visualization.previewBlobCid;
    const cdnUrl = "https://cdn.bsky.app/img/feed_thumbnail/plain/"+visualization.author.did+"/"+previewCid+"@jpeg"

    return <div style={{width, height}} className={width ? "" : "w-full"}>
        <Image
            src={cdnUrl}
            alt={""}
            width={400}
            height={300}
            className={"w-full " + (width ? "h-full" : "h-auto")}
        />
    </div>
}