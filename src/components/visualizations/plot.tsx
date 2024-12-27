"use client"
import {DatasetProps, FilterProps, PlotConfigProps} from "../../app/lib/definitions";
import {VegaLite, VisualizationSpec} from "react-vega";
import {useEffect, useState} from "react";
import LoadingSpinner from "../loading-spinner";
import {getSpecForConfig} from "./spec";


export const Plot = ({config}: {config: PlotConfigProps}) => {
    const [data, setData] = useState<any[] | null>()

    const dataUrl = "/dataset/" + config.dataset.cid

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(dataUrl);
                const json = await response.json();
                setData(json)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [dataUrl])

    if(!data) return <LoadingSpinner/>

    const spec = getSpecForConfig(config, data)

    return (
        <div className={"flex justify-center"}>
            <VegaLite spec={spec} actions={false} />
        </div>
    );
}