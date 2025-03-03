import {EngagementProps, VisualizationProps} from "../../app/lib/definitions";
import {contentUrl, formatIsoDate, urlFromRecord} from "../utils/utils";
import {Authorship} from "../feed/content-top-row-author";
import {CustomLink} from "../ui-utils/custom-link";
import {EngagementIcons} from "../reactions/engagement-icons";
import Link from "next/link";
import {DateSince} from "../ui-utils/date";
import {VegaPlotPreview} from "./vega-plot";
import TableChartIcon from '@mui/icons-material/TableChart';

function getTitleFromSpec(spec: string){
    try {
        const json = JSON.parse(spec)
        return json.title.text
    } catch {
        return null
    }
}


export const VisualizationCard = ({visualization, width}: {visualization: VisualizationProps & EngagementProps, width: number}) => {
    const url = urlFromRecord(visualization as {uri: string, collection: string, author: {did: string, handle: string}})

    const title = getTitleFromSpec(visualization.visualization.spec)

    return <CustomLink
        className={"cursor-pointer flex flex-col rounded"}
        style={{width}}
        href={url}
    >
        <div className={"h-full flex items-center p-2"} style={{height: width*0.6}}>
            <VegaPlotPreview visualization={visualization} width={width-10}/>
        </div>

        <div className={"px-2 pb-1 flex items-center text-center flex-col"} style={{width}}>
            {title && <div className={"font-semibold"}>
                {title}
            </div>}

            <div className={"flex space-x-1 text-sm items-end py-1"}>
                <Link
                    style={{maxWidth: width}}
                    className={"bg-[var(--background-dark)] flex rounded-lg space-x-2 hover:bg-[var(--background-dark2)] px-2"}
                    href={contentUrl(visualization.visualization.dataset.uri)}
                >
                    <div className={"text-[var(--text-light)]"}>
                        <TableChartIcon fontSize={"inherit"} color={"inherit"}/>
                    </div>
                    <div className={"truncate"}>
                        {visualization.visualization.dataset.dataset.title}
                    </div>
                </Link>
            </div>

            <div className={"text-sm space-x-1 truncate flex items-center text-[var(--text-light)]"}>
                <Authorship content={visualization} onlyAuthor={true}/>
                <span className="text-[var(--text-light)]">•</span>
                <span className="text-[var(--text-light)] flex-shrink-0"
                      title={formatIsoDate(visualization.createdAt)}
                >
                    <DateSince date={visualization.createdAt}/>
                </span>
            </div>

            <div className={"mt-1 flex justify-center px-2"}>
                <EngagementIcons record={visualization} counters={visualization}
                                 className={"flex justify-between w-full px-4"}/>
            </div>
        </div>
    </CustomLink>
}