"use client"
import {useState} from "react";
import Link from "next/link";
import SelectionComponent from "@/components/buscar/search-selection-component";
import AddIcon from "@mui/icons-material/Add";
import {useDatasets, useVisualizations} from "@/hooks/swr";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {VisualizationsFeed} from "@/components/visualizations/visualizations-feed";
import {DatasetsFeed} from "@/components/datasets/datasets-feed";
import {NewDatasetPanel} from "@/components/datasets/new-dataset-panel";
import {MobileHeader} from "@/components/layout/mobile-header";
import {Button} from "../../../modules/ui-utils/src/button";


const Page = () => {
    const {visualizations} = useVisualizations()
    const {datasets} = useDatasets()
    const [selected, onSelection] = useState("Visualizaciones")
    const [openNewDatasetPanel, setOpenNewDatasetPanel] = useState(false)

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div
                    className={"pb-1 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    const loading = <div className={"pt-8"}><LoadingSpinner/></div>

    return <div className={"flex flex-col"}>
        <MobileHeader/>
        <div className="flex border-b items-center justify-between max-w-screen overflow-scroll no-scrollbar pr-2">
            {<SelectionComponent
                onSelection={onSelection}
                options={["Visualizaciones", "Datos"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex justify-between"
            />}
            {selected == "Visualizaciones" && <Link href={"/datos/nueva-visualizacion"}>
                <Button
                    startIcon={<AddIcon/>}
                    variant={"text"}
                    size={"small"}
                    sx={{height: "32px"}}
                >
                    Visualización
                </Button>
            </Link>}
            {selected == "Datos" && <Button
                startIcon={<AddIcon/>}
                variant={"text"}
                size={"small"}
                sx={{height: "32px"}}
                onClick={() => {setOpenNewDatasetPanel(true)}}
            >
                Dataset
            </Button>}
        </div>

        <div className={"flex flex-col"}>
            {selected == "Visualizaciones" && (visualizations ?
                <VisualizationsFeed visualizations={visualizations}/> :
                loading
            )}
            {selected == "Datos" && (datasets ? <DatasetsFeed datasets={datasets}/> : loading)}
        </div>
        <NewDatasetPanel open={openNewDatasetPanel} onClose={() => {setOpenNewDatasetPanel(false)}}/>
    </div>
}


export default Page