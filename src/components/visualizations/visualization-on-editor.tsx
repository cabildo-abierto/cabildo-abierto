"use client"
import {DatasetProps, PlotConfigProps} from "../../app/lib/definitions";
import LoadingSpinner from "../loading-spinner";
import {getSpecForConfig} from "./editor/spec";
import embed from "vega-embed";
import {useEffect, useRef} from "react";
import {View} from "vega";


export const VisualizationOnEditor = ({config, setCurrentView, dataset}: {
    config: PlotConfigProps
    setCurrentView: (v: View) => void
    dataset: { data?: any[], dataset?: DatasetProps }
}) => {
    const chartRef = useRef()

    useEffect(() => {

        const renderChart = async () => {
            const spec = getSpecForConfig(config, dataset, true)

            const result = await embed(chartRef.current, spec, {actions: false, config: {background: null}});
            const { view } = result; // Access Vega view object
            setCurrentView(view)
        };

        if(dataset && dataset.data){
            renderChart()
        }
    },[config, dataset])

    if(!dataset || !dataset.data) return <LoadingSpinner/>


    return <div className="h-full flex items-center justify-center" ref={chartRef}/>
}