import {useEffect, useRef, useState} from "react";
import SelectionComponent from "../../buscar/search-selection-component";
import {ChooseDatasetPanel} from "./choose-dataset";
import {ConfigPanel} from "./config-panel";
import {StateButtonClickHandler} from "../../utils/base/state-button";
import {cn} from "@/lib/utils";
import {PlotConfigProps} from "./types";
import DatasetIcon from "@/components/utils/icons/dataset-icon";
import VisualizationIcon from "@/components/utils/icons/visualization-icon";
import {BaseButton} from "@/components/utils/base/base-button";
import { ArCabildoabiertoDataDataset } from "@cabildo-abierto/api";

const VisualizationEditorSidebar = ({
                                        datasets,
                                        config,
                                        selected,
                                        setConfig,
                                        setSelected,
                                        maxWidth,
                                        baseWidth,
                                        onReloadData,
                                        onNewDataset,
    creatingNewDataset
                                    }: {
    datasets: ArCabildoabiertoDataDataset.DatasetViewBasic[],
    config: PlotConfigProps,
    setConfig: (config: PlotConfigProps) => void,
    selected: string
    setSelected: (v: string) => void
    baseWidth: number
    maxWidth: number
    onReloadData?: StateButtonClickHandler
    onNewDataset?: () => void
    creatingNewDataset: boolean
}) => {
    const [width, setWidth] = useState<number>(baseWidth);
    const isResizing = useRef(false);

    useEffect(() => {
        setWidth(baseWidth)
    }, [baseWidth])

    const startResize = () => {
        isResizing.current = true;
        document.body.style.cursor = "col-resize";
    };

    const stopResize = () => {
        isResizing.current = false;
        document.body.style.cursor = "";
    };

    const handleResize = (e: MouseEvent) => {
        if (isResizing.current) {
            const newWidth = e.clientX;
            const clampedWidth = Math.max(baseWidth, Math.min(newWidth, maxWidth));
            setWidth(clampedWidth);
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleResize);
        window.addEventListener("mouseup", stopResize);
        return () => {
            window.removeEventListener("mousemove", handleResize);
            window.removeEventListener("mouseup", stopResize);
        };
    }, []);

    function optionsNodes(o: string, isSelected: boolean) {
        const icon = o == "Datos" ? <DatasetIcon/> : <VisualizationIcon/>
        return <BaseButton
            className={isSelected ? "group-[.portal]:bg-[var(--background-dark3)] group-[.portal]:hover:bg-[var(--background-dark4)]" : ""}
            startIcon={icon}
            variant={"outlined"}
        >
            {o}
        </BaseButton>
    }

    return (
        <div
            style={{width}}
            className={cn("z-[1400] absolute border-r border-[var(--accent-dark)] top-0 left-0 h-full flex flex-col group portal", isResizing ? "select-none" : "")}
        >
            <div className="flex flex-col h-full">
                <div className="p-2">
                    <SelectionComponent
                        onSelection={setSelected}
                        options={["Datos", "Visualización"]}
                        optionsNodes={optionsNodes}
                        selected={selected}
                        className={"flex space-x-2"}
                        optionContainerClassName={""}
                    />
                </div>

                {selected == "Datos" && <ChooseDatasetPanel
                    datasets={datasets}
                    config={config}
                    setConfig={setConfig}
                    onReloadData={onReloadData}
                    onNewDataset={onNewDataset}
                    creatingNewDataset={creatingNewDataset}
                />}
                {selected == "Visualización" && <ConfigPanel config={config} setConfig={setConfig}/>}
            </div>

            <div
                onMouseDown={startResize}
                className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10"
            />
        </div>
    );
};

export default VisualizationEditorSidebar;
