import Link from "next/link";
import {contentUrl} from "../utils/utils";
import TableChartIcon from "@mui/icons-material/TableChart";


export const DatasetTitle = ({dataset}: {dataset: {uri?: string, dataset: {title: string}}}) => {
    return <span className={"exclude-links"}>
        <Link
            className={"flex items-center space-x-2 bg-[var(--background-dark)] rounded-lg hover:bg-[var(--background-dark2)] px-2 text-sm"}
            href={contentUrl(dataset.uri)}
        >
            <div className={"text-[var(--text-light)]"}>
                <TableChartIcon fontSize={"inherit"} color={"inherit"}/>
            </div>
            <div className={"truncate"}>
                {dataset.dataset.title}
            </div>
        </Link>
    </span>
}