import {Authorship} from "../feed/content-top-row-author";
import {DatasetView} from "./dataset-view";
import {DatasetProps, EngagementProps} from "@/lib/types";
import {useDataset} from "../../hooks/swr";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {DatasetDescription} from "./dataset-description";
import {EngagementIcons} from "@/components/feed/reactions/engagement-icons";
import {useLayoutConfig} from "../layout/layout-config-context";
import {DateSince} from "../../../modules/ui-utils/src/date";


export const DatasetOnThread = ({dataset}: {dataset: DatasetProps & EngagementProps}) => {
    const {dataset: datasetWithData, isLoading, error} = useDataset(dataset.uri)
    const {layoutConfig} = useLayoutConfig()

    return <div className={"px-2 border-b w-full"}>
        <h2>{dataset.dataset.title}</h2>
        <div className={"text-sm text-[var(--text-light)] space-x-1 flex items-center"}>
            <div><Authorship content={dataset} text={"Publicado por"}/></div>
            <div><DateSince date={dataset.createdAt}/></div>
        </div>
        <div className={"mt-4 text-[var(--text-light)]"}>
            <div className={"font-semibold text-[var(--text)]"}>
                Descripción
            </div>
            <DatasetDescription
                description={dataset.dataset.description}
            />
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