"use client"
import {PlotConfigProps} from "../../app/lib/definitions";
import {VegaLite} from "react-vega";
import LoadingSpinner from "../loading-spinner";
import {getSpecForConfig} from "./spec";
import {useDataset} from "../../hooks/contents";


export const Plot = ({config}: {config: PlotConfigProps}) => {
    const {dataset} = useDataset(config.dataset.uri)

    if(!dataset) return <LoadingSpinner/>

    const spec = getSpecForConfig(config, dataset.data)

    return (
        <div className={"flex justify-center"}>
            <VegaLite spec={spec} actions={false} />
        </div>
    );
}