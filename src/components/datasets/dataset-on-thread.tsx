import {Authorship} from "@/components/feed/frame/content-top-row-author";
import {DatasetTableView} from "./dataset-table-view";
import {useDataset} from "@/hooks/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {DatasetDescription} from "./dataset-description";
import {useLayoutConfig} from "../layout/layout-config-context";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";


// TO DO
export const DatasetOnThread = ({dataset}: {dataset: DatasetView}) => {
    const {data: datasetWithData, isLoading, error} = useDataset(dataset.uri)
    const {layoutConfig} = useLayoutConfig()

    const data = []

    return <div className={"px-2 border-b w-full"}>
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
            <div>
                {datasetWithData &&
                    <div className={"text-[var(--text-light)] space-x-1 flex items-center"}>
                        <div className={"font-semibold"}>{data.length}</div>
                        <div>filas x</div>
                        <div className={"font-semibold"}>{dataset.columns.length}</div>
                        <div>columnas</div>
                    </div>
                }
            </div>
            <div className={"font-semibold text-[var(--text)] mt-4"}>
                Datos
            </div>
        </div>
        <div className={"mt-1"}>
            {isLoading ? <LoadingSpinner/> : datasetWithData && datasetWithData ?
            <DatasetTableView
                maxWidth={layoutConfig.maxWidthCenter}
                maxHeight="500px"
                data={[]} // TO DO
            /> :
                <></>}
        </div>
        {/* TO DO <div className={"py-2 border-t"}>
            <EngagementIcons content={dataset}/>
        </div>*/}
        {error && <div className={"py-4 text-center"}>
            {error.message}
        </div>}
    </div>
}