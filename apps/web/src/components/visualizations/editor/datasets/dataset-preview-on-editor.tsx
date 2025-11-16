import {Authorship} from "../../../perfil/authorship";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api/dist"
import {DateSince} from "@/components/utils/base/date";


export const DatasetPreviewOnEditor = ({dataset, selected, onClick}: {
    dataset: ArCabildoabiertoDataDataset.DatasetViewBasic | ArCabildoabiertoDataDataset.DatasetView,
    selected: boolean,
    onClick: () => void
}) => {
    return <div
        className={"py-1 border border-[var(--accent-dark)] px-2 cursor-pointer hover:bg-[var(--background-dark2)] " + (selected ? "bg-[var(--background-dark2)]" : "")}
        onClick={onClick}
    >
        <div className={"flex justify-between space-x-1"}>
            <div className={"font-medium text-[16px] break-all truncate"}>
                {dataset.name}
            </div>
        </div>
        <div className={"text-[var(--text-light)] text-sm font-light"}>
            <span className={"font-semibold"}>{dataset.columns.length}</span> columnas
        </div>
        <div className={"text-sm text-[var(--text-light)] truncate flex space-x-1"}>
            <div className={"font-light"}>Publicado por</div>
            <Authorship author={dataset.author} onlyAuthor={true}/>
        </div>
        <div className={"text-[var(--text-light)] text-sm font-light"}>
            {dataset.editedAt ? <span>
                Últ. actualización hace <DateSince date={dataset.editedAt}/>
            </span> : <span>
                Hace <DateSince date={dataset.createdAt}/>
            </span>}

        </div>
    </div>
}