import Link from "next/link";
import {contentUrl} from "../utils";


export const DatasetTitle = ({dataset}: {dataset: {uri?: string, dataset: {title: string}}}) => {
    return <span className={"exclude-links"}>
        <Link
            className={"bg-[var(--background-dark)] rounded-lg hover:bg-[var(--background-dark2)] px-2 text-sm"}
            href={contentUrl(dataset.uri)}
        >
            {dataset.dataset.title}
        </Link>
    </span>
}