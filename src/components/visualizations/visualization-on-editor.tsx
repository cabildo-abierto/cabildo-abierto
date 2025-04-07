"use client"
import {DatasetProps, PlotConfigProps} from "@/lib/definitions";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {getSpecForConfig} from "./editor/get-spec";
import embed from "vega-embed";
import {useEffect, useRef} from "react";
import {View} from "vega";


export const VisualizationOnEditor = ({config, setCurrentView, dataset}: {
    config: PlotConfigProps
    setCurrentView: (v: View) => void
    dataset: { data?: any[], dataset?: DatasetProps }
}) => {
    const chartRef = useRef(null)

    useEffect(() => {

        const renderChart = async () => {
            const spec = getSpecForConfig(config, dataset, true)

            const result = await embed(chartRef.current, spec, {actions: false})
            const { view } = result;
            setCurrentView(view)
        }

        if(dataset && dataset.data){
            renderChart()
        }
    },[config, dataset])

    if(!dataset || !dataset.data) return <div className={"p-4"}>
        <LoadingSpinner/>
    </div>


    return <div className="h-full flex items-center justify-center" ref={chartRef}/>
}