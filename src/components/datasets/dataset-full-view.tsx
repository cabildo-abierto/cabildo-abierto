import {DatasetTableView} from "./dataset-table-view";
import {DatasetDescription} from "./dataset-description";
import {useLayoutConfig} from "../layout/layout-config-context";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {pxToNumber} from "@/utils/strings";
import {Authorship} from "@/components/feed/frame/authorship";


export const DatasetFullView = ({dataset}: { dataset: DatasetView }) => {
    const {layoutConfig} = useLayoutConfig()

    const rows = JSON.parse(dataset.data).length

    return <div className={"px-2 w-full h-full"}>
        <h2>{dataset.name}</h2>
        <div className={"text-sm text-[var(--text-light)] space-x-1 flex items-center"}>
            <div><Authorship content={dataset} text={"Publicado por"}/></div>
            <div><DateSince date={dataset.createdAt}/></div>
        </div>
        <div className={"mt-4 text-[var(--text-light)]"}>
            <div className={"font-semibold text-[var(--text)]"}>
                Descripción
            </div>
            <DatasetDescription
                description={dataset.description}
            />
            <div className={"font-semibold text-[var(--text)] mt-4"}>
                Tamaño
            </div>
            <div className={"text-[var(--text-light)] space-x-1 flex items-center"}>
                <div className={"font-semibold"}>{rows}</div>
                <div>filas x</div>
                <div className={"font-semibold"}>{dataset.columns.length}</div>
                <div>columnas</div>
            </div>
            <div className={"font-semibold text-[var(--text)] mt-4"}>
                Datos
            </div>
        </div>
        <div className={"mt-1 h-full"}>
            <DatasetTableView
                dataset={dataset}
                maxWidth={pxToNumber(layoutConfig.maxWidthCenter)}
                maxHeight={300}
            />
        </div>
    </div>
}