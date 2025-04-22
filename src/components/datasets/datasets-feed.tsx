import {DatasetProps, EngagementProps} from "@/lib/types";
import {Authorship} from "../feed/content-top-row-author";
import {EngagementIcons} from "@/components/feed/reactions/engagement-icons";
import {CustomLink} from "../../../modules/ui-utils/src/custom-link";
import {CardFeed} from "../../../modules/ui-utils/src/card-feed";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {urlFromRecord} from "@/utils/uri";


export const SmallDatasetPreview = ({ dataset, width, height }: {
    dataset: DatasetProps, width: number, height: number }) => {
    const columns = dataset.dataset.columns;

    return (
        <div
            className="border mb-4 overflow-x-clip overflow-y-clip text-sm"
            style={{
                width: width,
                height: height,
            }}
        >
            <table className="table-auto w-full border-collapse border">
                <thead className="bg-[var(--background-dark2)]">
                <tr>
                    {columns.map((header, colIndex) => (
                        <th key={colIndex} className="border px-4 py-2 text-left">
                            {header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="even:bg-[var(--background-dark)]">
                        {columns.map((_, colIndex) => (
                            <td key={colIndex} className="border px-4 py-2 text-[var(--text-light)]">
                                <span className="opacity-50">—</span>
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};



const DatasetCard = ({dataset, width}: {
    dataset: DatasetProps & EngagementProps
    width: number
}) => {
    const url = urlFromRecord(dataset.uri)


    return <div
        style={{width}}
        className={"flex flex-col items-center text-center"}
    >
        <CustomLink href={url}>
            <SmallDatasetPreview
                dataset={dataset}
                width={width}
                height={Math.min(width*0.8, 180)}
            />
        </CustomLink>

        <CustomLink href={url} className={"font-semibold"} style={{width}}>
            {dataset.dataset.title}
        </CustomLink>

        <div className={"text-sm space-x-1 flex items-center text-[var(--text-light)] break-all"}>
            <div><Authorship content={dataset} onlyAuthor={true}/></div>
            <div className="text-[var(--text-light)]">• </div>
            <div><DateSince date={dataset.createdAt}/></div>
        </div>

        <div className={"mt-1 flex justify-center"}>
            <EngagementIcons record={dataset} counters={dataset} className={"space-x-2"}/>
        </div>
    </div>
}


export const DatasetsFeed = ({ datasets }: { datasets: (DatasetProps & EngagementProps)[] }) => {
    function generator(e: any, width: number) {
        return <DatasetCard dataset={e} width={width}/>
    }

    return <CardFeed
        elements={datasets}
        generator={generator}
    />
}