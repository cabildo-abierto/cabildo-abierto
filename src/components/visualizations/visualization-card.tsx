import {EngagementProps, VisualizationProps} from "@/lib/types";
import {Authorship} from "@/components/feed/frame/content-top-row-author";
import {CustomLink} from "../../../modules/ui-utils/src/custom-link";
import {EngagementIcons} from "@/components/feed/frame/engagement-icons";
import Link from "next/link";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {VegaPlotPreview} from "./vega-plot-preview";
import TableChartIcon from '@mui/icons-material/TableChart';
import {useSWRConfig} from "swr";
import {contentUrl, urlFromRecord} from "../../utils/uri";
import {formatIsoDate} from "../../utils/dates";

function getTitleFromSpec(spec: string){
    try {
        const json = JSON.parse(spec)
        return json.title.text
    } catch {
        return null
    }
}


export const VisualizationCard = ({visualization, width}: {visualization: VisualizationProps & EngagementProps, width: number}) => {
    const {mutate} = useSWRConfig()
    const url = urlFromRecord(visualization.uri)

    const title = getTitleFromSpec(visualization.visualization.spec)

    async function onDelete(){
        mutate("/api/visualizations")
    }

    return <div
        className={"flex flex-col rounded"}
        style={{width}}
    >
        <CustomLink href={url} className={"h-full flex items-center p-2"} style={{height: width*0.6}}>
            <VegaPlotPreview visualization={visualization} width={width-10}/>
        </CustomLink>

        <div className={"px-2 pb-1 flex items-center text-center flex-col"} style={{width}}>
            {title && <CustomLink href={url} className={"font-semibold"}>
                {title}
            </CustomLink>}

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
                <EngagementIcons
                    record={visualization}
                    counters={visualization}
                    className={"flex justify-between w-full px-4"}
                    onDelete={onDelete}
                />
            </div>
        </div>
    </div>
}