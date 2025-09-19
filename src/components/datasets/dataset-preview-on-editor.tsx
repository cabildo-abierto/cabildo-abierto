import {DateSince} from "../../../modules/ui-utils/src/date";
import {Authorship} from "@/components/feed/frame/authorship";
import {ArCabildoabiertoDataDataset} from "@/lex-api/index"


export const DatasetPreviewOnEditor = ({dataset, selected, onClick}: {
    dataset: ArCabildoabiertoDataDataset.DatasetViewBasic | ArCabildoabiertoDataDataset.DatasetView,
    selected: boolean,
    onClick: () => void
}) => {
    return <div
        className={"py-1 border border-[var(--text-lighter)] px-2 cursor-pointer hover:bg-[var(--background-dark2)] " + (selected ? "bg-[var(--background-dark2)]" : "")}
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