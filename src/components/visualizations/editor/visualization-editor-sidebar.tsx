import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {PlotConfigProps} from "@/lib/types";
import {useEffect, useRef, useState} from "react";
import {Button} from "../../layout/utils/button";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {ChooseDatasetPanel} from "@/components/visualizations/editor/choose-dataset";
import {ConfigPanel} from "@/components/visualizations/editor/config-panel";
import VisualizationIcon from "@/components/layout/icons/visualization-icon";
import DatasetIcon from "@/components/layout/icons/dataset-icon";
import {StateButtonClickHandler} from "../../layout/utils/state-button";

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
    datasets: DatasetViewBasic[],
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
        return <Button
            color={isSelected ? "background-dark2" : "background-dark"}
            startIcon={icon}
            variant={"outlined"}
            borderColor={"accent-dark"}
        >
            {o}
        </Button>
    }

    return (
        <div
            style={{width}}
            className={"z-[1400] absolute top-0 left-0 bg-[var(--background-dark)] h-full rounded-l-lg flex flex-col " + (isResizing ? "select-none" : "")}
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
