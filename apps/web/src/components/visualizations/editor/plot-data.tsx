import {Authorship} from "../../perfil/authorship";
import {ChooseDatasetPanelFiltersConfig} from "./choose-dataset";
import {DatasetDescription} from "./datasets/dataset-description";
import {TableIcon} from "@phosphor-icons/react";
import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoDataDataset} from "@cabildo-abierto/api/dist"
import {cn} from "@/lib/utils";
import {DateSince} from "@/components/utils/base/date";
import {ModalOnClick} from "@/components/utils/base/modal-on-click";
import {BaseNotButton} from "@/components/utils/base/base-not-button";
import {visualizationViewToMain} from "@/components/visualizations/visualization/utils";
import {contentUrl} from "@/components/utils/react/url";

export const PlotData = ({visualization}: { visualization: ArCabildoabiertoEmbedVisualization.View }) => {
    const dataset = visualization.dataset

    const href = ArCabildoabiertoDataDataset.isDatasetView(dataset) ? contentUrl(dataset.uri, dataset.author.handle) : null

    const modal = (onClose: () => void) => <div className={""}>
        {ArCabildoabiertoDataDataset.isDatasetView(dataset) && <div
            className={cn("py-2 space-y-1 px-2 cursor-pointer", href && "hover:bg-[var(--background-dark2)]")}
            onClick={(e) => {
                e.stopPropagation();
                if (href) window.open(href, "_blank")
            }}
        >
            <div className={"flex justify-between space-x-1"}>
                <div className={"font-semibold text-[16px] break-all truncate"}>
                    {dataset.name}
                </div>
            </div>
            <div className={"max-w-[400px] text-sm line-clamp-5"}>
                <DatasetDescription description={dataset.description}/>
            </div>
            <div className={"text-sm text-[var(--text-light)] truncate flex space-x-1"}>
                <div>Publicado por</div>
                <Authorship author={dataset.author} onlyAuthor={true}/>
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                Últ. actualización hace <DateSince date={dataset.editedAt ?? dataset.createdAt}/>
            </div>
        </div>}
        {ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <div
            className={"py-2 space-y-1 px-2 text-sm text-[var(--text-light)] cursor-pointer"}
        >
            <div className={"font-semibold text-[var(--text)]"}>
                Construído en base a propiedades en temas de la wiki.
            </div>
            <div>
                Filtro usado:
            </div>
            <div className={"pointer-events-none"}>
                <ChooseDatasetPanelFiltersConfig
                    config={visualizationViewToMain(visualization)}
                />
            </div>
        </div>}
    </div>

    return <ModalOnClick
        modal={modal}
        className={"z-[1501] p-0"}
    >
        <BaseNotButton
            className={"mt-1"}
            variant={"outlined"}
            size={"small"}
            startIcon={<TableIcon/>}
        >
            Datos
        </BaseNotButton>
    </ModalOnClick>
}