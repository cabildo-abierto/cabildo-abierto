import {DateSince} from "../../../modules/ui-utils/src/date";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {Authorship} from "@/components/feed/frame/authorship";

export const DatasetPreviewOnEditor = ({dataset, selected, onClick}: {
    dataset: DatasetViewBasic | DatasetView,
    selected: boolean,
    onClick: () => void
}) => {
    return <div
        className={"py-1 rounded px-2 cursor-pointer hover:bg-[var(--background-dark3)] " + (selected ? "bg-[var(--background-dark3)]" : "bg-[var(--background-dark2)]")}
        onClick={onClick}
    >
        <div className={"flex justify-between space-x-1"}>
            <div className={"font-semibold text-[16px] break-all truncate"}>
                {dataset.name}
            </div>
        </div>
        <div className={"text-[var(--text-light)] text-sm"}>
            <span className={"font-semibold"}>{dataset.columns.length}</span> columnas
        </div>
        <div className={"text-sm text-[var(--text-light)] truncate flex space-x-1"}>
            <div>Publicado por</div>
            <Authorship author={dataset.author} onlyAuthor={true}/>
        </div>
        <div className={"text-[var(--text-light)] text-sm"}>
            Hace <DateSince date={dataset.createdAt}/>
        </div>
    </div>
}