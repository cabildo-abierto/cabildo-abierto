import {EngagementProps, VisualizationProps} from "../../app/lib/definitions";
import Image from "next/image";
import {contentUrl, formatIsoDate, urlFromRecord} from "../utils";
import {Authorship, ContentTopRowAuthor} from "../content-top-row-author";
import {CustomLink} from "../custom-link";
import {EngagementIcons} from "../feed/engagement-icons";
import Link from "next/link";
import {DateSince} from "../date";


function getTitleFromSpec(spec: string){
    try {
        const json = JSON.parse(spec)
        return json.title.text
    } catch {
        return null
    }
}


export const VisualizationCard = ({visualization, width}: {visualization: VisualizationProps & EngagementProps, width: number}) => {
    const previewCid = visualization.visualization.previewBlobCid
    const url = urlFromRecord(visualization as {uri: string, collection: string, author: {did: string, handle: string}})

    const title = getTitleFromSpec(visualization.visualization.spec)

    return <CustomLink
        className={"cursor-pointer rounded h-56"}
        style={{width}}
        href={url}
    >
        <Image
            src={"https://cdn.bsky.app/img/feed_thumbnail/plain/"+visualization.author.did+"/"+previewCid+"@jpeg"}
            alt={""}
            width={400}
            height={300}
            className={"w-full h-auto"}
        />

        <div className={"px-2"}>
            {title && <div className={"font-semibold"}>
                {title}
            </div>}

            <div className={"flex space-x-1 text-sm items-end py-1"}>
                <div className={"text-[var(--text-light)]"}>
                    Datos:
                </div>
                <Link
                    className={"bg-[var(--background-dark)] truncate rounded-lg hover:bg-[var(--background-dark2)] px-2"}
                    href={contentUrl(visualization.visualization.dataset.uri)}
                >
                    {visualization.visualization.dataset.dataset.title}
                </Link>
            </div>

            <div className={"text-sm space-x-1 truncate flex items-center text-[var(--text-light)]"}>
                <Authorship content={visualization} onlyAuthor={true}/>
                <span className="text-[var(--text-light)]">•</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(visualization.createdAt)}>
                    <DateSince date={visualization.createdAt}/>
                </span>
            </div>

            <div className={"mt-1 flex justify-center"}>
                <EngagementIcons record={visualization} counters={visualization} className={"space-x-2"}/>
            </div>
        </div>
    </CustomLink>
}