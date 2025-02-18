"use client"
import {useState} from "react";
import {BasicButton} from "../../components/ui-utils/basic-button";
import '../../components/datasets/index.css'
import Link from "next/link";
import SelectionComponent from "../../components/search-selection-component";
import AddIcon from "@mui/icons-material/Add";
import {Button} from "@mui/material";
import {useDatasets, useVisualizations} from "../../hooks/contents";
import LoadingSpinner from "../../components/loading-spinner";
import {VisualizationsFeed} from "../../components/visualizations/visualizations-feed";
import {DatasetsFeed} from "../../components/datasets/datasets-feed";


const Page = () => {
    const {visualizations} = useVisualizations()
    const {datasets} = useDatasets()
    const [selected, onSelection] = useState("Visualizaciones")

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] w-40">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0

                }}
            >
                <div
                    className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    const loading = <div className={"pt-8"}><LoadingSpinner/></div>

    return <div className={"flex flex-col"}>
        <div className="flex border-b items-center justify-between pr-2">
            {<SelectionComponent
                onSelection={onSelection}
                options={["Visualizaciones", "Datos"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex justify-between"
            />}
            {selected == "Visualizaciones" && <Link href={"/nueva-visualizacion"}>
                <BasicButton
                    startIcon={<AddIcon/>}
                    variant={"text"}
                    size={"small"}
                    sx={{height: "32px", width: "168px"}}
                >
                    Nueva visualización
                </BasicButton>
            </Link>}
            {selected == "Datos" && <Link href={"/datasets"}>
                <BasicButton
                    startIcon={<AddIcon/>}
                    variant={"text"}
                    size={"small"}
                    sx={{height: "32px", width: "168px"}}
                >
                    Nuevo dataset
                </BasicButton>
            </Link>}
        </div>

        <div className={"flex flex-col"}>
            {selected == "Visualizaciones" && (visualizations ?
                <VisualizationsFeed visualizations={visualizations}/> :
                loading
            )}
            {selected == "Datos" && (datasets ? <DatasetsFeed datasets={datasets}/> : loading)}
        </div>
    </div>
}


export default Page