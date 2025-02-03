"use client"
import {PlotConfigProps} from "../../app/lib/definitions";
import LoadingSpinner from "../loading-spinner";
import {getSpecForConfig} from "./spec";
import {useDataset} from "../../hooks/contents";
import embed from "vega-embed";
import {useEffect, useRef} from "react";
import {View} from "vega";


export const VisualizationOnEditor = ({config, setCurrentView}: {
    config: PlotConfigProps, setCurrentView: (v: View) => void}) => {
    const {dataset} = useDataset(config.dataset.uri)
    const chartRef = useRef()

    useEffect(() => {

        const renderChart = async () => {
            const spec = getSpecForConfig(config, dataset.data)

            const result = await embed(chartRef.current, spec, {actions: false});
            const { view } = result; // Access Vega view object
            setCurrentView(view)
        };

        if(dataset && dataset.data){
            renderChart()
        }
    },[config, dataset])

    if(!dataset) return <LoadingSpinner/>


    return (
        <div className={"flex justify-center"}>
            <div ref={chartRef}/>
        </div>
    );
}