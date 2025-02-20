import {Authorship} from "../content-top-row-author";
import {DatasetView} from "./dataset-view";
import {DatasetProps, EngagementProps} from "../../app/lib/definitions";
import {useDataset} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";
import {DatasetDescription} from "./dataset-description";
import {EngagementIcons} from "../feed/engagement-icons";
import {useLayoutConfig} from "../layout/layout-config-context";
import {DateSince} from "../date";


export const DatasetOnThread = ({dataset}: {dataset: DatasetProps & EngagementProps}) => {
    const {dataset: datasetWithData, isLoading, error} = useDataset(dataset.uri)
    const {layoutConfig} = useLayoutConfig()

    return <div className={"px-2 mt-4 border-b w-full"}>
        <div className={"flex justify-between w-full"}>
            <div className={"text-[var(--text-light)]"}>
                Conjunto de datos
            </div>
        </div>
        <h1>{dataset.dataset.title}</h1>
        <div className={"text-sm text-[var(--text-light)] space-x-1 flex items-center"}>
            <div><Authorship content={dataset} text={"Publicado por"}/></div>
            <div>•</div>
            <div><DateSince date={dataset.createdAt}/></div>
        </div>
        <div className={"mt-4 text-[var(--text-light)]"}>
            <div className={"font-semibold text-[var(--text)]"}>
                Descripción
            </div>
            <DatasetDescription description={dataset.dataset.description}/>
            <div className={"font-semibold text-[var(--text)] mt-4"}>
                Tamaño
            </div>
            <div>
                {datasetWithData &&
                    <div className={"text-[var(--text-light)] space-x-1 flex items-center"}>
                        <div className={"font-semibold"}>{datasetWithData.data.length}</div>
                        <div>filas x</div>
                        <div className={"font-semibold"}>{dataset.dataset.columns.length}</div>
                        <div>columnas</div>
                    </div>
                }
            </div>
            <div className={"font-semibold text-[var(--text)] mt-4"}>
                Datos
            </div>
        </div>
        <div className={"mt-1"}>
            {isLoading ? <LoadingSpinner/> : datasetWithData && datasetWithData.data ?
            <DatasetView maxWidth={layoutConfig.maxWidthCenter} maxHeight="500px" data={datasetWithData.data}/> : <></>}
        </div>
        <div className={"py-2 border-t"}>
            <EngagementIcons counters={dataset} record={dataset}/>
        </div>
        {error && <div className={"py-4 text-center"}>
            {error}
        </div>}
    </div>
}